import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Roles that can request transaction signing
const SIGNING_ROLES = ['SUPER_ADMIN', 'CUSTODY_OFFICER', 'TOKENIZATION_MANAGER', 'OPERATIONS_ADMIN'];

interface SigningRequest {
  walletId: string;
  txType: string;
  unsignedTxBlob: string;
  unsignedTxHash: string;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: string;
  amount?: number;
  currency?: string;
  destination?: string;
  destinationName?: string;
  metadata?: Record<string, unknown>;
}

interface SigningPolicy {
  policy_id: string;
  policy_name: string;
  max_amount_xrp: number | null;
  requires_multi_sign: boolean;
  min_signers: number;
  rate_limit_per_minute: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    // =========================================================================
    // SECURITY: JWT Verification and Role Check
    // =========================================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[sign-transaction] Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized - missing token',
          errorCode: 'UNAUTHORIZED' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth token for validation
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify JWT and get claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseAuth.auth.getClaims(token);

    if (authError || !claimsData?.claims?.sub) {
      console.error('[sign-transaction] Token verification failed:', authError?.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized - invalid token',
          errorCode: 'UNAUTHORIZED' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`[sign-transaction] Authenticated user: ${userId}`);

    // Use service role client to check user roles and perform operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .rpc('get_user_roles', { _user_id: userId });

    if (rolesError) {
      console.error('[sign-transaction] Failed to fetch user roles:', rolesError.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to verify permissions',
          errorCode: 'INTERNAL_ERROR' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has required role
    const hasPermission = userRoles?.some((role: string) => 
      SIGNING_ROLES.includes(role)
    );

    if (!hasPermission) {
      console.error(`[sign-transaction] User ${userId} lacks required role. Has: ${userRoles?.join(', ')}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Forbidden - insufficient permissions',
          errorCode: 'FORBIDDEN',
          required: SIGNING_ROLES,
          current: userRoles 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sign-transaction] User ${userId} authorized with roles: ${userRoles?.join(', ')}`);
    // =========================================================================
    // END SECURITY BLOCK
    // =========================================================================

    const body: SigningRequest = await req.json();
    
    console.log(`[sign-transaction] Signing request for wallet ${body.walletId}, tx type: ${body.txType}`);

    // Validate required fields
    if (!body.walletId || !body.txType || !body.unsignedTxBlob || !body.unsignedTxHash) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: walletId, txType, unsignedTxBlob, unsignedTxHash',
          errorCode: 'INVALID_REQUEST' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // STEP 1: Fetch wallet and verify status
    // =========================================================================
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('id', body.walletId)
      .single();

    if (walletError || !wallet) {
      console.error('[sign-transaction] Wallet not found:', walletError?.message);
      await logSigningAudit(supabaseAdmin, {
        ...body,
        walletAddress: 'UNKNOWN',
        keyStorageType: 'UNKNOWN',
        network: 'UNKNOWN',
        status: 'REJECTED',
        rejectionReason: 'Wallet not found',
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Wallet not found',
          errorCode: 'WALLET_NOT_FOUND' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check wallet status
    if (wallet.status === 'SUSPENDED') {
      await logSigningAudit(supabaseAdmin, {
        ...body,
        walletAddress: wallet.xrpl_address,
        keyStorageType: wallet.key_storage_type,
        network: wallet.network,
        status: 'REJECTED',
        rejectionReason: 'Wallet is suspended',
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Wallet is suspended',
          errorCode: 'WALLET_SUSPENDED' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (wallet.status === 'ARCHIVED') {
      await logSigningAudit(supabaseAdmin, {
        ...body,
        walletAddress: wallet.xrpl_address,
        keyStorageType: wallet.key_storage_type,
        network: wallet.network,
        status: 'REJECTED',
        rejectionReason: 'Wallet is archived',
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Wallet is archived',
          errorCode: 'WALLET_ARCHIVED' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // STEP 2: Check if LEGACY_DB wallet on mainnet (BLOCKED)
    // =========================================================================
    if (wallet.key_storage_type === 'LEGACY_DB' && wallet.network === 'mainnet') {
      console.error('[sign-transaction] LEGACY_DB wallet cannot sign on mainnet');
      await logSigningAudit(supabaseAdmin, {
        ...body,
        walletAddress: wallet.xrpl_address,
        keyStorageType: wallet.key_storage_type,
        network: wallet.network,
        status: 'REJECTED',
        rejectionReason: 'Legacy wallets cannot sign mainnet transactions. Migration required.',
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Legacy wallets cannot sign mainnet transactions. Migration required.',
          errorCode: 'LEGACY_MAINNET_BLOCKED' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // STEP 3: Get applicable signing policy
    // =========================================================================
    const { data: policyData } = await supabaseAdmin
      .rpc('get_signing_policy', { 
        p_wallet_role: wallet.role,
        p_network: wallet.network,
        p_tx_type: body.txType,
      });

    const policy: SigningPolicy | null = policyData?.[0] || null;

    if (!policy) {
      console.warn(`[sign-transaction] No policy found for role=${wallet.role}, network=${wallet.network}, txType=${body.txType}`);
      // Allow transaction but log warning (testnet only)
      if (wallet.network === 'mainnet') {
        await logSigningAudit(supabaseAdmin, {
          ...body,
          walletAddress: wallet.xrpl_address,
          keyStorageType: wallet.key_storage_type,
          network: wallet.network,
          status: 'REJECTED',
          rejectionReason: 'No signing policy found for this transaction type',
        });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No signing policy found for this transaction type',
            errorCode: 'POLICY_VIOLATION' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // =========================================================================
    // STEP 4: Validate against policy
    // =========================================================================
    if (policy) {
      // Check amount limit
      if (policy.max_amount_xrp !== null && body.amount && body.amount > policy.max_amount_xrp) {
        await logSigningAudit(supabaseAdmin, {
          ...body,
          walletAddress: wallet.xrpl_address,
          keyStorageType: wallet.key_storage_type,
          network: wallet.network,
          policyId: policy.policy_id,
          policyName: policy.policy_name,
          status: 'REJECTED',
          rejectionReason: `Amount ${body.amount} exceeds policy limit of ${policy.max_amount_xrp} XRP`,
        });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Amount exceeds policy limit of ${policy.max_amount_xrp} XRP`,
            errorCode: 'AMOUNT_LIMIT_EXCEEDED' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check multi-sign requirement
      if (policy.requires_multi_sign && !wallet.multi_sign_enabled) {
        await logSigningAudit(supabaseAdmin, {
          ...body,
          walletAddress: wallet.xrpl_address,
          keyStorageType: wallet.key_storage_type,
          network: wallet.network,
          policyId: policy.policy_id,
          policyName: policy.policy_name,
          status: 'REJECTED',
          rejectionReason: 'Policy requires multi-signature but wallet is not configured for multi-sign',
        });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Policy requires multi-signature but wallet is not configured for multi-sign',
            errorCode: 'MULTI_SIGN_REQUIRED' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check rate limit
      const { data: withinRateLimit } = await supabaseAdmin
        .rpc('check_signing_rate_limit', {
          p_wallet_id: wallet.id,
          p_limit_per_minute: policy.rate_limit_per_minute,
        });

      if (!withinRateLimit) {
        await logSigningAudit(supabaseAdmin, {
          ...body,
          walletAddress: wallet.xrpl_address,
          keyStorageType: wallet.key_storage_type,
          network: wallet.network,
          policyId: policy.policy_id,
          policyName: policy.policy_name,
          status: 'REJECTED',
          rejectionReason: 'Rate limit exceeded',
        });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Rate limit exceeded. Please wait before submitting another transaction.',
            errorCode: 'RATE_LIMIT_EXCEEDED' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // =========================================================================
    // STEP 5: Route to appropriate signing adapter
    // =========================================================================
    let signedTxBlob: string;
    let txHash: string;

    try {
      if (wallet.key_storage_type === 'LEGACY_DB') {
        // Sign using encrypted seed from database (testnet only)
        const result = await signWithLegacyAdapter(wallet, body.unsignedTxBlob, supabaseServiceKey);
        signedTxBlob = result.signedTxBlob;
        txHash = result.txHash;
      } else if (wallet.key_storage_type === 'VAULT') {
        // Sign using vault adapter
        const result = await signWithVaultAdapter(wallet.vault_key_ref, body.unsignedTxBlob);
        signedTxBlob = result.signedTxBlob;
        txHash = result.txHash;
      } else {
        throw new Error(`Unsupported key storage type: ${wallet.key_storage_type}`);
      }
    } catch (signingError) {
      const errorMessage = signingError instanceof Error ? signingError.message : 'Unknown signing error';
      console.error('[sign-transaction] Signing failed:', errorMessage);
      await logSigningAudit(supabaseAdmin, {
        ...body,
        walletAddress: wallet.xrpl_address,
        keyStorageType: wallet.key_storage_type,
        network: wallet.network,
        policyId: policy?.policy_id,
        policyName: policy?.policy_name,
        status: 'FAILED',
        errorMessage,
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Signing failed: ' + errorMessage,
          errorCode: wallet.key_storage_type === 'VAULT' ? 'VAULT_ERROR' : 'INTERNAL_ERROR' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // STEP 6: Log successful signing
    // =========================================================================
    const auditLogId = await logSigningAudit(supabaseAdmin, {
      ...body,
      walletAddress: wallet.xrpl_address,
      keyStorageType: wallet.key_storage_type,
      network: wallet.network,
      policyId: policy?.policy_id,
      policyName: policy?.policy_name,
      status: 'SIGNED',
      txHash,
    });

    console.log(`[sign-transaction] Transaction signed successfully. Hash: ${txHash}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        signedTxBlob,
        txHash,
        auditLogId,
        policyApplied: policy?.policy_name || 'none',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[sign-transaction] Unexpected error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error', 
        errorCode: 'INTERNAL_ERROR',
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Sign transaction using legacy encrypted seed (testnet only)
 * WARNING: This is deprecated and should only be used for testnet wallets
 */
async function signWithLegacyAdapter(
  wallet: Record<string, unknown>,
  unsignedTxBlob: string,
  serviceKey: string
): Promise<{ signedTxBlob: string; txHash: string }> {
  console.log(`[sign-transaction] Using LEGACY adapter for wallet ${wallet.id} (testnet only)`);
  
  // Decrypt seed (simplified XOR - in production use proper KMS)
  const encryptedSeed = wallet.encrypted_seed as string;
  if (!encryptedSeed) {
    throw new Error('No encrypted seed found for legacy wallet');
  }

  const keyBytes = new TextEncoder().encode(serviceKey.slice(0, 32));
  const encryptedBytes = Uint8Array.from(atob(encryptedSeed), c => c.charCodeAt(0));
  
  const decryptedBytes = new Uint8Array(encryptedBytes.length);
  for (let i = 0; i < encryptedBytes.length; i++) {
    decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  const seed = new TextDecoder().decode(decryptedBytes);

  // For now, return a mock signed transaction
  // In production, use xrpl.js to sign with the decrypted seed
  // This is a placeholder that simulates signing
  const mockTxHash = 'TX' + crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 62);
  
  // In real implementation:
  // import { Wallet } from 'xrpl';
  // const walletObj = Wallet.fromSeed(seed);
  // const signed = walletObj.sign(unsignedTxBlob);
  // return { signedTxBlob: signed.tx_blob, txHash: signed.hash };

  return {
    signedTxBlob: unsignedTxBlob + '_SIGNED_LEGACY',
    txHash: mockTxHash,
  };
}

/**
 * Sign transaction using vault adapter
 * In production, this would call HashiCorp Vault Transit engine or AWS KMS
 */
async function signWithVaultAdapter(
  vaultKeyRef: string | null,
  unsignedTxBlob: string
): Promise<{ signedTxBlob: string; txHash: string }> {
  console.log(`[sign-transaction] Using VAULT adapter for key ref: ${vaultKeyRef}`);
  
  if (!vaultKeyRef) {
    throw new Error('No vault key reference found');
  }

  // Parse vault key reference
  // Format: vault://provider/path/to/key
  const keyParts = vaultKeyRef.replace('vault://', '').split('/');
  const provider = keyParts[0];

  // For now, return a mock signed transaction
  // In production, call the actual vault/KMS API
  const mockTxHash = 'TX' + crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 62);

  // In real implementation:
  // if (provider === 'hashicorp') {
  //   const vaultClient = new VaultClient(Deno.env.get('VAULT_ADDR'));
  //   const signature = await vaultClient.transit.sign(keyPath, unsignedTxBlob);
  //   return { signedTxBlob, txHash };
  // }

  return {
    signedTxBlob: unsignedTxBlob + '_SIGNED_VAULT',
    txHash: mockTxHash,
  };
}

/**
 * Log signing attempt to audit log
 */
// deno-lint-ignore no-explicit-any
async function logSigningAudit(
  supabaseAdmin: any,
  data: {
    walletId: string;
    walletAddress: string;
    txType: string;
    unsignedTxHash: string;
    keyStorageType: string;
    network: string;
    status: string;
    requestedBy: string;
    requestedByName?: string;
    requestedByRole?: string;
    policyId?: string;
    policyName?: string;
    amount?: number;
    currency?: string;
    destination?: string;
    destinationName?: string;
    rejectionReason?: string;
    errorMessage?: string;
    txHash?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<string> {
  try {
    const { data: auditLog, error } = await supabaseAdmin
      .from('signing_audit_log')
      .insert({
        wallet_id: data.walletId,
        wallet_address: data.walletAddress,
        tx_type: data.txType,
        tx_hash: data.txHash,
        unsigned_tx_hash: data.unsignedTxHash,
        key_storage_type: data.keyStorageType,
        policy_id: data.policyId,
        policy_name: data.policyName,
        requested_by: data.requestedBy,
        requested_by_name: data.requestedByName,
        requested_by_role: data.requestedByRole,
        amount: data.amount,
        currency: data.currency,
        destination: data.destination,
        destination_name: data.destinationName,
        status: data.status,
        rejection_reason: data.rejectionReason,
        error_message: data.errorMessage,
        network: data.network,
        metadata: data.metadata || {},
      })
      .select('id')
      .single();

    if (error) {
      console.error('[sign-transaction] Failed to log audit:', error.message);
      return 'AUDIT_LOG_FAILED';
    }

    return auditLog?.id || 'UNKNOWN';
  } catch (err) {
    console.error('[sign-transaction] Audit log exception:', err);
    return 'AUDIT_LOG_ERROR';
  }
}
