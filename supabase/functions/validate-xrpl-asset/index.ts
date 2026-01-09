import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Known valid assets cache
const validatedAssets = new Map<string, { valid: boolean; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // =========================================================================
    // SECURITY: JWT Verification
    // =========================================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[validate-xrpl-asset] Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);

    if (authError || !claimsData?.claims?.sub) {
      console.error('[validate-xrpl-asset] Token verification failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[validate-xrpl-asset] Authenticated user: ${claimsData.claims.sub}`);
    // =========================================================================
    // END SECURITY BLOCK
    // =========================================================================

    const { asset, network = "mainnet" } = await req.json();
    
    console.log(`[validate-xrpl-asset] Validating: ${asset?.currency} (${asset?.type})`);
    
    // XRP is always valid
    if (asset?.type === "XRP" || asset?.currency === "XRP") {
      return new Response(
        JSON.stringify({ valid: true, asset }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // IOU must have currency and issuer
    if (!asset?.currency || !asset?.issuer) {
      console.log("[validate-xrpl-asset] Invalid: missing currency or issuer");
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "IOU asset must have currency and issuer",
          asset 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const cacheKey = `${network}:${asset.currency}:${asset.issuer}`;
    
    // Check cache
    const cached = validatedAssets.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[validate-xrpl-asset] Cache hit: ${cacheKey} = ${cached.valid}`);
      return new Response(
        JSON.stringify({ valid: cached.valid, asset }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate issuer address format
    if (!isValidXRPLAddress(asset.issuer)) {
      console.log("[validate-xrpl-asset] Invalid issuer address format");
      validatedAssets.set(cacheKey, { valid: false, timestamp: Date.now() });
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Invalid issuer address format",
          asset 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate currency code format (standard or hex)
    if (!isValidCurrencyCode(asset.currency)) {
      console.log("[validate-xrpl-asset] Invalid currency code format");
      validatedAssets.set(cacheKey, { valid: false, timestamp: Date.now() });
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Invalid currency code format",
          asset 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Try to verify the issuer account exists on the ledger
    const issuerValid = await verifyIssuerAccount(asset.issuer, network);
    
    validatedAssets.set(cacheKey, { valid: issuerValid, timestamp: Date.now() });
    
    console.log(`[validate-xrpl-asset] Result: ${issuerValid}`);
    
    return new Response(
      JSON.stringify({ 
        valid: issuerValid, 
        asset,
        ...(issuerValid ? {} : { error: "Issuer account not found on ledger" })
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("[validate-xrpl-asset] Error:", error);
    // FAIL CLOSED - do not allow unverified operations for security
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: "Validation service unavailable - operation blocked for safety" 
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Validate XRPL address format
 */
function isValidXRPLAddress(address: string): boolean {
  // XRPL addresses start with 'r' and are 25-35 characters
  if (!address || typeof address !== "string") return false;
  if (!address.startsWith("r")) return false;
  if (address.length < 25 || address.length > 35) return false;
  // Basic character validation (Base58 alphabet without 0, O, I, l)
  const validChars = /^r[1-9A-HJ-NP-Za-km-z]+$/;
  return validChars.test(address);
}

/**
 * Validate currency code format
 * Standard: 3 ASCII characters (not "XRP")
 * Non-standard: 40 character hex string
 */
function isValidCurrencyCode(currency: string): boolean {
  if (!currency || typeof currency !== "string") return false;
  
  // Cannot be "XRP" (reserved)
  if (currency.toUpperCase() === "XRP") return false;
  
  // Standard currency: 3 characters
  if (currency.length === 3) {
    // Must be printable ASCII
    return /^[A-Za-z0-9]{3}$/.test(currency);
  }
  
  // Non-standard currency: 40 hex characters
  if (currency.length === 40) {
    return /^[0-9A-Fa-f]{40}$/.test(currency);
  }
  
  return false;
}

/**
 * Verify issuer account exists on the XRPL
 * FAIL CLOSED: Returns false on any error for security
 */
async function verifyIssuerAccount(issuer: string, network: string): Promise<boolean> {
  const rpcUrl = network === "mainnet"
    ? "https://xrplcluster.com"
    : network === "testnet"
    ? "https://s.altnet.rippletest.net:51234"
    : "https://s.devnet.rippletest.net:51234";
  
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "account_info",
        params: [{ account: issuer }],
      }),
    });
    
    if (!response.ok) {
      console.log("[validate-xrpl-asset] RPC request failed");
      return false; // FAIL CLOSED - do not allow unverified
    }
    
    const data = await response.json();
    
    // Account exists if no error
    if (data.result?.account_data) {
      return true;
    }
    
    // Account not found
    if (data.result?.error === "actNotFound") {
      return false;
    }
    
    // Unknown response - FAIL CLOSED
    console.log("[validate-xrpl-asset] Unknown RPC response, failing closed");
    return false;
    
  } catch (err) {
    console.error("[validate-xrpl-asset] RPC error:", err);
    // FAIL CLOSED on network errors for security
    return false;
  }
}
