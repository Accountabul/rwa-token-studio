import { Business, BusinessFilters, BusinessListResult, BusinessStats } from "@/types/business";

/**
 * Repository interface for business operations
 * Implementations: MockBusinessRepository, SupabaseBusinessRepository
 */
export interface IBusinessRepository {
  /**
   * Get a single business by ID
   */
  getBusiness(id: string): Promise<Business | null>;

  /**
   * List businesses with optional filters
   */
  listBusinesses(filters?: BusinessFilters): Promise<BusinessListResult>;

  /**
   * Get businesses owned by a specific user
   */
  getBusinessesByOwner(ownerId: string): Promise<Business[]>;

  /**
   * Get business statistics
   */
  getBusinessStats(): Promise<BusinessStats>;

  /**
   * Get business by wallet address
   */
  getBusinessByWallet(walletAddress: string): Promise<Business | null>;
}
