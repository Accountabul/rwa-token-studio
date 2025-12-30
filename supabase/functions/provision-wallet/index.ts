import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// XRPL Testnet Faucet endpoint
const TESTNET_FAUCET_URL = "https://faucet.altnet.rippletest.net/accounts";

interface ProvisionRequest {
  name: string;
  role: string;
  network: "testnet" | "devnet";
  enableMultiSig: boolean;
  autoFund: boolean;
  createdBy: string;
  createdByName: string;
  // Extended fields
  description?: string;
  tags?: string[];
  purposeCode?: string;
  riskTier?: string;
  reviewFrequency?: string;
  businessUnit?: string;
  jurisdiction?: string;
  assetClass?: string;
  contactEmail?: string;
  contactPhone?: string;
  externalRefId?: string;
  // Identity
  didMethod?: string;
  verifiableCredentials?: string[];
  vcIssuerCapable?: boolean;
  // Capabilities
  canIssueTokens?: boolean;
  canMintNfts?: boolean;
  canClawback?: boolean;
  canFreeze?: boolean;
  canCreateEscrows?: boolean;
  canManageAmm?: boolean;
  canCreateChannels?: boolean;
  canAuthorizeHolders?: boolean;
  requiresDestinationTag?: boolean;
  // Multi-sig
  multiSignQuorum?: number;
  multiSignSigners?: number;
}

interface FaucetResponse {
  account: {
    xAddress: string;
    classicAddress: string;
    secret: string;
  };
  amount: number;
  balance: number;
}

/**
 * Simple encryption for seed storage (testnet only)
 * In production, use proper KMS/Vault integration
 */
function encryptSeed(seed: string, key: string): string {
  const encoder = new TextEncoder();
  const seedBytes = encoder.encode(seed);
  const keyBytes = encoder.encode(key);
  
  const encrypted = new Uint8Array(seedBytes.length);
  for (let i = 0; i < seedBytes.length; i++) {
    encrypted[i] = seedBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return btoa(String.fromCharCode(...encrypted));
}

// Valid wallet roles
const VALID_ROLES = [
  "ISSUER", "TREASURY", "ESCROW", "OPS", "TEST",
  "CUSTODY", "SETTLEMENT", "BRIDGE", "ORACLE", 
  "COMPLIANCE", "COLD_STORAGE", "HOT_WALLET"
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ProvisionRequest = await req.json();
    
    console.log(`[provision-wallet] Starting wallet provisioning: ${body.name} (${body.role})`);

    // Validate input
    if (!body.name || body.name.length < 3) {
      return new Response(
        JSON.stringify({ error: "Wallet name must be at least 3 characters" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!VALID_ROLES.includes(body.role)) {
      return new Response(
        JSON.stringify({ error: `Invalid wallet role. Valid roles: ${VALID_ROLES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only testnet/devnet for now
    if (body.network !== "testnet" && body.network !== "devnet") {
      return new Response(
        JSON.stringify({ error: "Only testnet and devnet are supported" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Request wallet from XRPL Faucet
    console.log(`[provision-wallet] Requesting wallet from ${body.network} faucet...`);
    
    const faucetUrl = body.network === "devnet" 
      ? "https://faucet.devnet.rippletest.net/accounts"
      : TESTNET_FAUCET_URL;
    
    const faucetResponse = await fetch(faucetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!faucetResponse.ok) {
      const errorText = await faucetResponse.text();
      console.error(`[provision-wallet] Faucet error: ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Failed to provision wallet from faucet", details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const faucetData: FaucetResponse = await faucetResponse.json();
    console.log(`[provision-wallet] Wallet created: ${faucetData.account.classicAddress}`);

    // Encrypt the seed for storage
    const encryptionKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!.slice(0, 32);
    const encryptedSeed = encryptSeed(faucetData.account.secret, encryptionKey);

    // Build wallet data object with all fields
    const walletData: Record<string, unknown> = {
      name: body.name,
      role: body.role,
      network: body.network,
      status: 'ACTIVE',
      xrpl_address: faucetData.account.classicAddress,
      encrypted_seed: encryptedSeed,
      multi_sign_enabled: body.enableMultiSig,
      permission_dex_status: 'NOT_LINKED',
      is_authorized: false,
      balance: body.autoFund ? (faucetData.balance || 1000) : 0,
      created_by: body.createdBy,
      created_by_name: body.createdByName,
      funded_at: body.autoFund ? new Date().toISOString() : null,
      last_synced_at: new Date().toISOString(),
    };

    // Extended fields
    if (body.description) walletData.description = body.description;
    if (body.tags) walletData.tags = body.tags;
    if (body.purposeCode) walletData.purpose_code = body.purposeCode;
    if (body.riskTier) walletData.risk_tier = body.riskTier;
    if (body.reviewFrequency) walletData.review_frequency = body.reviewFrequency;
    if (body.businessUnit) walletData.business_unit = body.businessUnit;
    if (body.jurisdiction) walletData.jurisdiction = body.jurisdiction;
    if (body.assetClass) walletData.asset_class = body.assetClass;
    if (body.contactEmail) walletData.contact_email = body.contactEmail;
    if (body.contactPhone) walletData.contact_phone = body.contactPhone;
    if (body.externalRefId) walletData.external_ref_id = body.externalRefId;

    // Identity fields
    if (body.didMethod) walletData.did_method = body.didMethod;
    if (body.verifiableCredentials) walletData.verifiable_credentials = body.verifiableCredentials;
    if (body.vcIssuerCapable !== undefined) walletData.vc_issuer_capable = body.vcIssuerCapable;

    // Capability fields
    if (body.canIssueTokens !== undefined) walletData.can_issue_tokens = body.canIssueTokens;
    if (body.canMintNfts !== undefined) walletData.can_mint_nfts = body.canMintNfts;
    if (body.canClawback !== undefined) walletData.can_clawback = body.canClawback;
    if (body.canFreeze !== undefined) walletData.can_freeze = body.canFreeze;
    if (body.canCreateEscrows !== undefined) walletData.can_create_escrows = body.canCreateEscrows;
    if (body.canManageAmm !== undefined) walletData.can_manage_amm = body.canManageAmm;
    if (body.canCreateChannels !== undefined) walletData.can_create_channels = body.canCreateChannels;
    if (body.canAuthorizeHolders !== undefined) walletData.can_authorize_holders = body.canAuthorizeHolders;
    if (body.requiresDestinationTag !== undefined) walletData.requires_destination_tag = body.requiresDestinationTag;

    // Multi-sig fields
    if (body.multiSignQuorum) walletData.multi_sign_quorum = body.multiSignQuorum;
    if (body.multiSignSigners) walletData.multi_sign_signers = body.multiSignSigners;

    const { data: wallet, error: dbError } = await supabase
      .from('wallets')
      .insert(walletData)
      .select()
      .single();

    if (dbError) {
      console.error(`[provision-wallet] Database error: ${dbError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to store wallet", details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[provision-wallet] Wallet stored successfully: ${wallet.id}`);

    // Return wallet info (without the seed!)
    const response = {
      id: wallet.id,
      name: wallet.name,
      role: wallet.role,
      network: wallet.network,
      status: wallet.status,
      xrplAddress: wallet.xrpl_address,
      multiSignEnabled: wallet.multi_sign_enabled,
      permissionDexStatus: wallet.permission_dex_status,
      isAuthorized: wallet.is_authorized,
      balance: wallet.balance,
      createdBy: wallet.created_by,
      createdByName: wallet.created_by_name,
      createdAt: wallet.created_at,
      fundedAt: wallet.funded_at,
      lastSyncedAt: wallet.last_synced_at,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[provision-wallet] Unexpected error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
