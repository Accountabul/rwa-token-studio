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
  role: "ISSUER" | "TREASURY" | "ESCROW" | "OPS" | "TEST";
  network: "testnet" | "devnet";
  enableMultiSig: boolean;
  autoFund: boolean;
  createdBy: string;
  createdByName: string;
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
  // Simple XOR-based encryption for testnet - NOT for production
  const encoder = new TextEncoder();
  const seedBytes = encoder.encode(seed);
  const keyBytes = encoder.encode(key);
  
  const encrypted = new Uint8Array(seedBytes.length);
  for (let i = 0; i < seedBytes.length; i++) {
    encrypted[i] = seedBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return btoa(String.fromCharCode(...encrypted));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create Supabase client with service role for DB operations
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

    if (!["ISSUER", "TREASURY", "ESCROW", "OPS", "TEST"].includes(body.role)) {
      return new Response(
        JSON.stringify({ error: "Invalid wallet role" }),
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

    // Step 1: Request wallet from XRPL Testnet Faucet
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

    // Step 2: Encrypt the seed for storage
    const encryptionKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!.slice(0, 32);
    const encryptedSeed = encryptSeed(faucetData.account.secret, encryptionKey);

    // Step 3: Store wallet in database
    const walletData = {
      name: body.name,
      role: body.role,
      network: body.network,
      status: 'ACTIVE',
      xrpl_address: faucetData.account.classicAddress,
      encrypted_seed: encryptedSeed,
      multi_sign_enabled: body.enableMultiSig,
      permission_dex_status: 'NOT_LINKED',
      is_authorized: false,
      balance: body.autoFund ? faucetData.balance : 0,
      created_by: body.createdBy,
      created_by_name: body.createdByName,
      funded_at: body.autoFund ? new Date().toISOString() : null,
      last_synced_at: new Date().toISOString(),
    };

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
