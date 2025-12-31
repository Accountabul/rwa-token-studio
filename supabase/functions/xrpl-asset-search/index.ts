import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common assets for fallback
const COMMON_ASSETS = [
  { type: "XRP", currency: "XRP", name: "XRP (Native)" },
  { type: "IOU", currency: "RLUSD", issuer: "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De", name: "Ripple USD" },
  { type: "IOU", currency: "USD", issuer: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq", name: "GateHub USD" },
  { type: "IOU", currency: "EUR", issuer: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq", name: "GateHub EUR" },
  { type: "IOU", currency: "BTC", issuer: "rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL", name: "GateHub BTC" },
  { type: "IOU", currency: "ETH", issuer: "rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL", name: "GateHub ETH" },
  { type: "IOU", currency: "GBP", issuer: "r4GN9eEoz9K4BhMQXe4H1eYNtvtkwGdt8g", name: "Bitstamp GBP" },
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
    const { query, network = "mainnet", limit = 20 } = await req.json();
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
      if ("xrp".includes(searchQuery)) {
        assets.push({ type: "XRP", currency: "XRP", name: "XRP (Native)" });
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
            (a.name && a.name.toLowerCase().includes(searchQuery))
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
 * Fetch assets from XRPL indexer
 * Using XRPSCAN API for token discovery
 */
async function fetchFromIndexer(
  query: string,
  network: string
): Promise<typeof COMMON_ASSETS> {
  const assets: typeof COMMON_ASSETS = [];
  
  // Use Bithomp API for token search (more reliable for this use case)
  // Note: In production, you'd want to configure API keys via secrets
  const baseUrl = network === "mainnet" 
    ? "https://bithomp.com/api/v2" 
    : "https://test.bithomp.com/api/v2";
  
  try {
    // Search for tokens by currency code
    const response = await fetch(`${baseUrl}/tokens?search=${encodeURIComponent(query)}&limit=15`, {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.tokens && Array.isArray(data.tokens)) {
        for (const token of data.tokens) {
          assets.push({
            type: "IOU",
            currency: token.currency || token.currencyCode || query.toUpperCase(),
            issuer: token.issuer,
            name: token.name || token.currency || query.toUpperCase(),
          });
        }
      }
    }
  } catch (err) {
    console.log("[xrpl-asset-search] Bithomp API not available, using fallback");
  }
  
  // Also search XRPSCAN as backup
  if (assets.length < 5 && network === "mainnet") {
    try {
      const xrpscanResponse = await fetch(
        `https://api.xrpscan.com/api/v1/names?q=${encodeURIComponent(query)}&limit=10`
      );
      
      if (xrpscanResponse.ok) {
        const xrpscanData = await xrpscanResponse.json();
        if (Array.isArray(xrpscanData)) {
          for (const item of xrpscanData) {
            // XRPSCAN returns account names, we need to extract token info
            if (item.account && item.name) {
              // Check if this account is an issuer
              const alreadyHave = assets.some(a => a.issuer === item.account);
              if (!alreadyHave && query.length >= 3) {
                assets.push({
                  type: "IOU",
                  currency: query.toUpperCase().slice(0, 3),
                  issuer: item.account,
                  name: item.name,
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.log("[xrpl-asset-search] XRPSCAN API not available");
    }
  }
  
  // If still no results, check common assets
  if (assets.length === 0) {
    const filtered = COMMON_ASSETS.filter(
      (a) =>
        a.type !== "XRP" && // XRP already handled separately
        (a.currency.toLowerCase().includes(query) ||
          (a.name && a.name.toLowerCase().includes(query)))
    );
    assets.push(...filtered);
  }
  
  return assets;
}
