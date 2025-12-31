// XRPL Asset Types - Global canonical representation for all payment contexts

export type XRPLAssetType = "XRP" | "IOU" | "MPT";

/**
 * Canonical XRPL Asset representation
 * Used across all payment flows: single payments, batch, escrow, checks, channels, AMM
 */
export interface XRPLAsset {
  type: XRPLAssetType;
  currency: string;
  issuer?: string; // Required for IOU/MPT, omitted for XRP
  name?: string;   // Human-readable name from indexer (optional)
}

/**
 * XRPL Amount object for IOU transactions
 * Used when constructing the actual XRPL transaction
 */
export interface XRPLAmountObject {
  currency: string;
  issuer: string;
  value: string;
}

/**
 * XRPL Amount - can be string (for XRP drops) or object (for IOU)
 */
export type XRPLAmount = string | XRPLAmountObject;

/**
 * Search result from the asset search API
 */
export interface XRPLAssetSearchResult {
  type: XRPLAssetType;
  currency: string;
  issuer?: string;
  name?: string;
  // Additional metadata from indexer
  domain?: string;
  icon?: string;
  logoUrl?: string;
}

/**
 * Helper functions for XRPL assets
 */

// Check if asset is XRP (native)
export const isXRP = (asset: XRPLAsset | null): boolean => {
  return asset?.type === "XRP" || asset?.currency === "XRP";
};

// Check if asset is IOU
export const isIOU = (asset: XRPLAsset | null): boolean => {
  return asset?.type === "IOU" && !!asset?.issuer;
};

// Format asset for display (e.g., "RLUSD" or "XRP")
export const formatAssetDisplay = (asset: XRPLAsset | null): string => {
  if (!asset) return "";
  return asset.currency;
};

// Format asset with issuer for full display (e.g., "RLUSD (rPDX...5Nf9)")
export const formatAssetWithIssuer = (asset: XRPLAsset | null): string => {
  if (!asset) return "";
  if (asset.type === "XRP") return "XRP (Native)";
  if (!asset.issuer) return asset.currency;
  return `${asset.currency} (${shortenAddress(asset.issuer)})`;
};

// Shorten XRPL address for display
export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address || address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Create XRP asset
export const createXRPAsset = (): XRPLAsset => ({
  type: "XRP",
  currency: "XRP",
});

// Create IOU asset
export const createIOUAsset = (currency: string, issuer: string, name?: string): XRPLAsset => ({
  type: "IOU",
  currency,
  issuer,
  name,
});

/**
 * Build XRPL Amount for transaction
 * XRP: returns drops as string
 * IOU: returns Amount object
 */
export const buildXRPLAmount = (asset: XRPLAsset, value: string): XRPLAmount => {
  if (asset.type === "XRP") {
    // Convert XRP to drops (1 XRP = 1,000,000 drops)
    const xrpValue = parseFloat(value);
    if (isNaN(xrpValue)) return "0";
    return Math.floor(xrpValue * 1_000_000).toString();
  }
  
  // IOU Amount object
  if (!asset.issuer) {
    throw new Error("IOU asset must have an issuer");
  }
  
  return {
    currency: asset.currency,
    issuer: asset.issuer,
    value: value,
  };
};

/**
 * Parse XRPL Amount back to display value
 */
export const parseXRPLAmount = (amount: XRPLAmount): { value: string; asset: XRPLAsset } => {
  if (typeof amount === "string") {
    // XRP drops to XRP
    const drops = parseInt(amount, 10);
    const xrp = drops / 1_000_000;
    return {
      value: xrp.toString(),
      asset: createXRPAsset(),
    };
  }
  
  return {
    value: amount.value,
    asset: createIOUAsset(amount.currency, amount.issuer),
  };
};

// Validate asset is complete
export const validateAsset = (asset: XRPLAsset | null): boolean => {
  if (!asset) return false;
  if (asset.type === "XRP") return true;
  return !!(asset.currency && asset.issuer);
};

// Compare two assets for equality
export const assetsEqual = (a: XRPLAsset | null, b: XRPLAsset | null): boolean => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.type !== b.type) return false;
  if (a.currency !== b.currency) return false;
  if (a.type === "XRP") return true;
  return a.issuer === b.issuer;
};

// Get unique key for asset (useful for React keys)
export const getAssetKey = (asset: XRPLAsset): string => {
  if (asset.type === "XRP") return "XRP";
  return `${asset.currency}:${asset.issuer || ""}`;
};
