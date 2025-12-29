/**
 * Business Entity Types
 * Represents businesses that sign up on the platform to conduct operations
 */

export type BusinessType = "LLC" | "C_CORP" | "S_CORP" | "SOLE_PROP" | "PARTNERSHIP";

export type BusinessStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface Business {
  id: string;
  name: string;
  legalName: string;
  businessType: BusinessType;
  ein?: string; // Employer ID (masked - last 4 only)
  status: BusinessStatus;
  
  // Wallet linkage
  primaryWalletId?: string;
  primaryWalletAddress?: string;
  
  // Ownership
  ownerId: string; // User who owns/manages the business
  ownerName: string;
  
  // Location
  jurisdiction: string;
  countryCode: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface BusinessFilters {
  search?: string;
  status?: BusinessStatus | "all";
  businessType?: BusinessType | "all";
  limit?: number;
  offset?: number;
}

export interface BusinessListResult {
  businesses: Business[];
  total: number;
  hasMore: boolean;
}

export interface BusinessStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
}
