import { IBusinessRepository } from "@/domain/interfaces/IBusinessRepository";
import { Business, BusinessFilters, BusinessListResult, BusinessStats } from "@/types/business";
import { mockBusinesses } from "@/data/mockBusinesses";

/**
 * Mock implementation of IBusinessRepository
 */
export class MockBusinessRepository implements IBusinessRepository {
  private businesses: Business[];

  constructor() {
    this.businesses = [...mockBusinesses];
  }

  async getBusiness(id: string): Promise<Business | null> {
    return this.businesses.find(b => b.id === id) ?? null;
  }

  async listBusinesses(filters?: BusinessFilters): Promise<BusinessListResult> {
    let filtered = [...this.businesses];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchLower) ||
        b.legalName.toLowerCase().includes(searchLower) ||
        b.ownerName.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter(b => b.status === filters.status);
    }

    // Apply business type filter
    if (filters?.businessType && filters.businessType !== "all") {
      filtered = filtered.filter(b => b.businessType === filters.businessType);
    }

    // Apply pagination
    const total = filtered.length;
    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? 50;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      businesses: paginated,
      total,
      hasMore: offset + paginated.length < total,
    };
  }

  async getBusinessesByOwner(ownerId: string): Promise<Business[]> {
    return this.businesses.filter(b => b.ownerId === ownerId);
  }

  async getBusinessStats(): Promise<BusinessStats> {
    return {
      total: this.businesses.length,
      active: this.businesses.filter(b => b.status === "ACTIVE").length,
      pending: this.businesses.filter(b => b.status === "PENDING").length,
      suspended: this.businesses.filter(b => b.status === "SUSPENDED").length,
    };
  }

  async getBusinessByWallet(walletAddress: string): Promise<Business | null> {
    return this.businesses.find(b => b.primaryWalletAddress === walletAddress) ?? null;
  }
}

// Singleton instance
export const mockBusinessRepository = new MockBusinessRepository();
