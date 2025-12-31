// XRPL Asset API - Client-side interface for asset search

import { XRPLAsset, XRPLAssetSearchResult, createXRPAsset } from "@/types/xrplAsset";
import { supabase } from "@/integrations/supabase/client";

// Cache for asset search results
const searchCache = new Map<string, { results: XRPLAssetSearchResult[]; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Common/popular assets for empty search
const COMMON_ASSETS: XRPLAssetSearchResult[] = [
  { type: "XRP", currency: "XRP", name: "XRP (Native)" },
  { type: "IOU", currency: "RLUSD", issuer: "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De", name: "Ripple USD" },
  { type: "IOU", currency: "USD", issuer: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq", name: "GateHub USD" },
  { type: "IOU", currency: "EUR", issuer: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq", name: "GateHub EUR" },
  { type: "IOU", currency: "BTC", issuer: "rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL", name: "GateHub BTC" },
];

// Fallback assets when indexer is unavailable
const FALLBACK_ASSETS: XRPLAssetSearchResult[] = [
  { type: "XRP", currency: "XRP", name: "XRP (Native)" },
];

export type XRPLNetwork = "mainnet" | "testnet" | "devnet";

interface SearchOptions {
  network?: XRPLNetwork;
  limit?: number;
  includeXRP?: boolean;
}

/**
 * Search for XRPL assets by ticker or name
 * Uses edge function proxy to indexer API
 */
export async function searchXRPLAssets(
  query: string,
  options: SearchOptions = {}
): Promise<XRPLAssetSearchResult[]> {
  const { network = "mainnet", limit = 20, includeXRP = true } = options;
  const trimmedQuery = query.trim().toLowerCase();
  
  // Return common assets for empty query
  if (!trimmedQuery) {
    return includeXRP ? COMMON_ASSETS : COMMON_ASSETS.filter(a => a.type !== "XRP");
  }
  
  // Check cache
  const cacheKey = `${network}:${trimmedQuery}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }
  
  try {
    // Call edge function
    const { data, error } = await supabase.functions.invoke("xrpl-asset-search", {
      body: { query: trimmedQuery, network, limit },
    });
    
    if (error) {
      console.error("Asset search error:", error);
      return getFallbackResults(trimmedQuery, includeXRP);
    }
    
    let results: XRPLAssetSearchResult[] = data?.assets || [];
    
    // Always include XRP if it matches the query and includeXRP is true
    if (includeXRP && "xrp".includes(trimmedQuery)) {
      const hasXRP = results.some(r => r.type === "XRP");
      if (!hasXRP) {
        results = [{ type: "XRP", currency: "XRP", name: "XRP (Native)" }, ...results];
      }
    }
    
    // Cache results
    searchCache.set(cacheKey, { results, timestamp: Date.now() });
    
    return results.slice(0, limit);
  } catch (err) {
    console.error("Asset search failed:", err);
    return getFallbackResults(trimmedQuery, includeXRP);
  }
}

/**
 * Get fallback results when indexer is unavailable
 */
function getFallbackResults(query: string, includeXRP: boolean): XRPLAssetSearchResult[] {
  const results: XRPLAssetSearchResult[] = [];
  
  // Check if XRP matches
  if (includeXRP && "xrp".includes(query)) {
    results.push({ type: "XRP", currency: "XRP", name: "XRP (Native)" });
  }
  
  // Check common assets
  for (const asset of COMMON_ASSETS) {
    if (asset.type === "XRP") continue; // Already handled
    if (
      asset.currency.toLowerCase().includes(query) ||
      asset.name?.toLowerCase().includes(query)
    ) {
      results.push(asset);
    }
  }
  
  return results;
}

/**
 * Validate that an asset exists on the ledger
 * Returns true if valid, false if invalid
 */
export async function validateXRPLAsset(
  asset: XRPLAsset,
  network: XRPLNetwork = "mainnet"
): Promise<boolean> {
  // XRP is always valid
  if (asset.type === "XRP") return true;
  
  // IOU must have issuer
  if (!asset.issuer) return false;
  
  try {
    const { data, error } = await supabase.functions.invoke("validate-xrpl-asset", {
      body: { asset, network },
    });
    
    if (error) {
      console.error("Asset validation error:", error);
      // Allow through on error (fail open for UX)
      return true;
    }
    
    return data?.valid ?? false;
  } catch (err) {
    console.error("Asset validation failed:", err);
    // Allow through on error
    return true;
  }
}

/**
 * Get asset details from cache or API
 */
export async function getAssetDetails(
  currency: string,
  issuer?: string,
  network: XRPLNetwork = "mainnet"
): Promise<XRPLAsset | null> {
  if (currency === "XRP") {
    return createXRPAsset();
  }
  
  if (!issuer) return null;
  
  // Search for the specific asset
  const results = await searchXRPLAssets(currency, { network, limit: 50 });
  
  // Find exact match
  const match = results.find(
    r => r.currency === currency && r.issuer === issuer
  );
  
  if (match) {
    return {
      type: match.type,
      currency: match.currency,
      issuer: match.issuer,
      name: match.name,
    };
  }
  
  // Return constructed asset if no metadata found
  return {
    type: "IOU",
    currency,
    issuer,
  };
}

/**
 * Clear the search cache
 */
export function clearAssetCache(): void {
  searchCache.clear();
}
