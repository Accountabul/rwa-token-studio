import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common assets for fallback
const COMMON_ASSETS = [
  { type: "XRP", currency: "XRP", name: "XRP (Native)", logoUrl: "https://xrpl.org/img/xrp-logo.svg" },
  { type: "IOU", currency: "RLUSD", issuer: "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De", name: "Ripple USD", logoUrl: null },
  { type: "IOU", currency: "USD", issuer: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq", name: "GateHub USD", logoUrl: null },
  { type: "IOU", currency: "EUR", issuer: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq", name: "GateHub EUR", logoUrl: null },
  { type: "IOU", currency: "BTC", issuer: "rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL", name: "GateHub BTC", logoUrl: null },
  { type: "IOU", currency: "ETH", issuer: "rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL", name: "GateHub ETH", logoUrl: null },
  { type: "IOU", currency: "GBP", issuer: "r4GN9eEoz9K4BhMQXe4H1eYNtvtkwGdt8g", name: "Bitstamp GBP", logoUrl: null },
];

// In-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

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
      console.error('[xrpl-asset-search] Missing or invalid Authorization header');
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
      console.error('[xrpl-asset-search] Token verification failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[xrpl-asset-search] Authenticated user: ${claimsData.claims.sub}`);
    // =========================================================================
    // END SECURITY BLOCK
    // =========================================================================

    const { query, network = "mainnet", limit = 25 } = await req.json();
    const searchQuery = (query || "").toLowerCase().trim();
    
    console.log(`[xrpl-asset-search] Searching for: "${searchQuery}" on ${network}`);

    // Check cache first
    const cacheKey = `${network}:${searchQuery}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[xrpl-asset-search] Cache hit for: ${cacheKey}`);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build results
    let assets: typeof COMMON_ASSETS = [];
    
    // Empty query returns common assets
    if (!searchQuery) {
      assets = [...COMMON_ASSETS];
    } else {
      // Always check if XRP matches
      if ("xrp".includes(searchQuery) || "native".includes(searchQuery)) {
        assets.push({ type: "XRP", currency: "XRP", name: "XRP (Native)", logoUrl: "https://xrpl.org/img/xrp-logo.svg" });
      }
      
      // Try to fetch from XRPSCAN or Bithomp API
      try {
        const indexerAssets = await fetchFromIndexer(searchQuery, network);
        assets.push(...indexerAssets);
      } catch (indexerError) {
        console.error("[xrpl-asset-search] Indexer error:", indexerError);
        // Fall back to common assets on error
        const filteredCommon = COMMON_ASSETS.filter(
          (a) =>
            a.currency.toLowerCase().includes(searchQuery) ||
            (a.name && a.name.toLowerCase().includes(searchQuery)) ||
            (a.issuer && a.issuer.toLowerCase().includes(searchQuery))
        );
        assets.push(...filteredCommon);
      }
    }
    
    // Dedupe by currency+issuer
    const seen = new Set<string>();
    const uniqueAssets = assets.filter((a) => {
      const key = a.type === "XRP" ? "XRP" : `${a.currency}:${a.issuer}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const result = { assets: uniqueAssets.slice(0, limit) };
    
    // Cache results
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    console.log(`[xrpl-asset-search] Returning ${result.assets.length} assets`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[xrpl-asset-search] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    // Return error with fallback assets for graceful degradation
    return new Response(
      JSON.stringify({ error: message, assets: COMMON_ASSETS }),
      {
        status: 200, // Return 200 with fallback assets
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Check if query looks like an XRPL address (starts with 'r')
 */
function isAddressQuery(query: string): boolean {
  return query.startsWith("r") && query.length >= 6;
}

/**
 * Fetch assets from XRPL indexer
 * Supports search by: currency code, name, or issuer address
 */
async function fetchFromIndexer(
  query: string,
  network: string
): Promise<typeof COMMON_ASSETS> {
  const assets: typeof COMMON_ASSETS = [];
  const isAddressSearch = isAddressQuery(query);
  
  // Use XRPSCAN API - supports mainnet and testnet
  const xrpscanBase = network === "testnet" 
    ? "https://testnet.xrpscan.com/api/v1"
    : "https://api.xrpscan.com/api/v1";
  
  try {
    // Fetch token list from XRPSCAN
    console.log(`[xrpl-asset-search] Fetching from XRPSCAN: ${xrpscanBase}/tokens`);
    const response = await fetch(`${xrpscanBase}/tokens?limit=100`, {
      headers: { "Accept": "application/json" },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`[xrpl-asset-search] Got ${data?.length || 0} tokens from XRPSCAN`);
      
      if (Array.isArray(data)) {
        // Filter tokens that match the query
        const queryLower = query.toLowerCase();
        for (const token of data) {
          const currency = token.currency || token.currencyCode || "";
          const name = token.name || token.issuerName || "";
          const issuer = token.issuer || "";
          const icon = token.icon || token.logo || null;
          
          // Match by currency code, name, OR issuer address (full or partial)
          const matchesCurrency = currency.toLowerCase().includes(queryLower);
          const matchesName = name.toLowerCase().includes(queryLower);
          const matchesIssuer = issuer.toLowerCase().includes(queryLower);
          
          if (matchesCurrency || matchesName || matchesIssuer) {
            assets.push({
              type: "IOU",
              currency: currency,
              issuer: issuer,
              name: name || currency,
              logoUrl: icon,
            });
          }
        }
      }
    } else {
      console.log(`[xrpl-asset-search] XRPSCAN returned status: ${response.status}`);
    }
  } catch (err) {
    console.error("[xrpl-asset-search] XRPSCAN API error:", err);
  }
  
  // Also try Bithomp API as backup (has better search)
  if (assets.length < 5) {
    const bithompBase = network === "mainnet" 
      ? "https://bithomp.com/api/v2" 
      : "https://test.bithomp.com/api/v2";
    
    try {
      console.log(`[xrpl-asset-search] Trying Bithomp: ${bithompBase}/tokens`);
      const response = await fetch(
        `${bithompBase}/tokens?search=${encodeURIComponent(query)}&limit=20`,
        { headers: { "Accept": "application/json" } }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.tokens && Array.isArray(data.tokens)) {
          for (const token of data.tokens) {
            // Avoid duplicates
            const exists = assets.some(
              a => a.currency === token.currency && a.issuer === token.issuer
            );
            if (!exists) {
              assets.push({
                type: "IOU",
                currency: token.currency || token.currencyCode || query.toUpperCase(),
                issuer: token.issuer,
                name: token.name || token.currency || query.toUpperCase(),
                logoUrl: token.icon || token.logo || null,
              });
            }
          }
        }
      }
    } catch (err) {
      console.log("[xrpl-asset-search] Bithomp API not available");
    }
  }
  
  // If still no results, filter common assets by currency, name, OR issuer
  if (assets.length === 0) {
    const filtered = COMMON_ASSETS.filter(
      (a) =>
        a.type !== "XRP" &&
        (a.currency.toLowerCase().includes(query) ||
          (a.name && a.name.toLowerCase().includes(query)) ||
          (a.issuer && a.issuer.toLowerCase().includes(query)))
    );
    assets.push(...filtered);
  }
  
  console.log(`[xrpl-asset-search] Returning ${assets.length} assets from indexer`);
  return assets;
}
