// Valuation method types
export type ValuationMethod = "MANUAL" | "APPRAISAL" | "ORACLE";

// Token class types
export type TokenClass = "OWNERSHIP" | "ACCESS" | "REVENUE" | "UTILITY";

// Pricing modes
export type PricingMode = "FAIR_VALUE" | "ISSUER_DEFINED" | "HYBRID_DISCLOSURE";

// Currency options
export type PricingCurrency = "USD" | "RLUSD" | "XRP";

// Valuation data interface
export interface AssetValuation {
  valuationUsd: number;
  valuationMethod: ValuationMethod;
  valuationSourceRef?: string;
  valuationTimestamp: string;
}

// Token pricing configuration
export interface TokenPricing {
  valuation: AssetValuation;
  tokenClass: TokenClass;
  totalSupply: number;
  pricingMode: PricingMode;
  currency: PricingCurrency;
  fairValuePrice: number;
  issuerDefinedPrice?: number;
  priceDeviationPercent?: number;
  deviationAcknowledged?: boolean;
}

// Labels for display
export const valuationMethodLabel: Record<ValuationMethod, string> = {
  MANUAL: "Manual Entry",
  APPRAISAL: "Professional Appraisal",
  ORACLE: "Oracle Feed",
};

export const tokenClassLabel: Record<TokenClass, string> = {
  OWNERSHIP: "Ownership Token",
  ACCESS: "Access Token",
  REVENUE: "Revenue Share Token",
  UTILITY: "Utility Token",
};

export const pricingModeLabel: Record<PricingMode, string> = {
  FAIR_VALUE: "Fair Value",
  ISSUER_DEFINED: "Issuer-Defined",
  HYBRID_DISCLOSURE: "Hybrid Disclosure",
};

export const pricingCurrencyLabel: Record<PricingCurrency, string> = {
  USD: "USD",
  RLUSD: "RLUSD",
  XRP: "XRP",
};
