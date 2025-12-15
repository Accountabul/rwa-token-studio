import { PricingCurrency } from "@/types/tokenPricing";

// Deviation thresholds
export const DEVIATION_THRESHOLD_WARNING = 10; // 10% - show warning
export const DEVIATION_THRESHOLD_REQUIRE_ACK = 25; // 25% - require acknowledgment

/**
 * Calculate price per token based on valuation and supply
 */
export function calculatePricePerToken(
  valuationUsd: number,
  totalSupply: number
): number {
  if (!valuationUsd || !totalSupply || totalSupply <= 0) {
    return 0;
  }
  return valuationUsd / totalSupply;
}

/**
 * Calculate deviation percentage between fair value and issuer price
 */
export function calculatePriceDeviation(
  fairValue: number,
  issuerPrice: number
): number {
  if (!fairValue || fairValue <= 0) {
    return 0;
  }
  return ((issuerPrice - fairValue) / fairValue) * 100;
}

/**
 * Get deviation severity level
 */
export type DeviationSeverity = "none" | "low" | "medium" | "high";

export function getDeviationSeverity(deviationPercent: number): DeviationSeverity {
  const absDeviation = Math.abs(deviationPercent);
  if (absDeviation <= 5) return "none";
  if (absDeviation <= DEVIATION_THRESHOLD_WARNING) return "low";
  if (absDeviation <= DEVIATION_THRESHOLD_REQUIRE_ACK) return "medium";
  return "high";
}

/**
 * Generate warning message based on deviation
 */
export function generateDeviationWarning(deviationPercent: number): string | null {
  const severity = getDeviationSeverity(deviationPercent);
  const direction = deviationPercent > 0 ? "above" : "below";
  const absDeviation = Math.abs(deviationPercent).toFixed(1);

  switch (severity) {
    case "none":
    case "low":
      return null;
    case "medium":
      return `Issuer price is ${absDeviation}% ${direction} fair value. This deviation is within acceptable range but may require disclosure.`;
    case "high":
      return `Issuer price is ${absDeviation}% ${direction} fair value. This significant deviation requires explicit acknowledgment before proceeding.`;
    default:
      return null;
  }
}

/**
 * Check if deviation requires acknowledgment
 */
export function requiresDeviationAcknowledgment(deviationPercent: number): boolean {
  return Math.abs(deviationPercent) > DEVIATION_THRESHOLD_REQUIRE_ACK;
}

/**
 * Format price for display
 */
export function formatPrice(
  price: number,
  currency: PricingCurrency = "USD",
  decimals: number = 2
): string {
  if (!price || isNaN(price)) {
    return currency === "USD" ? "$0.00" : "0.00";
  }

  const formatted = price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  switch (currency) {
    case "USD":
      return `$${formatted}`;
    case "RLUSD":
      return `${formatted} RLUSD`;
    case "XRP":
      return `${formatted} XRP`;
    default:
      return formatted;
  }
}

/**
 * Format valuation for display
 */
export function formatValuation(valuationUsd: number): string {
  if (!valuationUsd) return "$0";
  
  if (valuationUsd >= 1_000_000_000) {
    return `$${(valuationUsd / 1_000_000_000).toFixed(2)}B`;
  }
  if (valuationUsd >= 1_000_000) {
    return `$${(valuationUsd / 1_000_000).toFixed(2)}M`;
  }
  if (valuationUsd >= 1_000) {
    return `$${(valuationUsd / 1_000).toFixed(1)}K`;
  }
  return `$${valuationUsd.toLocaleString()}`;
}

/**
 * Validate pricing configuration
 */
export interface PricingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validatePricing(
  valuationUsd: number | undefined,
  totalSupply: number | undefined,
  valuationMethod: string | undefined,
  tokenClass: string | undefined,
  pricingMode: string,
  issuerDefinedPrice: number | undefined,
  deviationAcknowledged: boolean | undefined
): PricingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (!valuationUsd || valuationUsd <= 0) {
    errors.push("Asset valuation is required and must be greater than 0");
  }
  if (!totalSupply || totalSupply <= 0) {
    errors.push("Total supply is required and must be greater than 0");
  }
  if (!valuationMethod) {
    errors.push("Valuation method is required");
  }
  if (!tokenClass) {
    errors.push("Token class is required");
  }

  // Issuer-defined price validation
  if (pricingMode !== "FAIR_VALUE" && valuationUsd && totalSupply) {
    if (!issuerDefinedPrice || issuerDefinedPrice <= 0) {
      errors.push("Issuer-defined price is required for this pricing mode");
    } else {
      const fairValue = calculatePricePerToken(valuationUsd, totalSupply);
      const deviation = calculatePriceDeviation(fairValue, issuerDefinedPrice);
      
      if (requiresDeviationAcknowledgment(deviation) && !deviationAcknowledged) {
        errors.push("You must acknowledge the significant price deviation before proceeding");
      }
      
      const warning = generateDeviationWarning(deviation);
      if (warning) {
        warnings.push(warning);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
