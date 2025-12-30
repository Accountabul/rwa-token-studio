import {
  IPayeeRepository,
  PayeeFilters,
  PayeeListResult,
  CreatePayeeParams,
} from "@/domain/interfaces/IPayeeRepository";
import { Payee, PayeeStatus, PayeeVerificationStatus } from "@/types/payout";
import { mockPayees, searchMockPayees } from "@/data/mockPayees";

/**
 * Mock implementation of IPayeeRepository
 */
export class MockPayeeRepository implements IPayeeRepository {
  private payees: Payee[] = [...mockPayees];

  async searchPayees(query: string, limit: number = 10): Promise<Payee[]> {
    // Simulate async behavior
    await new Promise((resolve) => setTimeout(resolve, 100));
    return searchMockPayees(query, limit);
  }

  async getPayee(id: string): Promise<Payee | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.payees.find((p) => p.id === id) ?? null;
  }

  async listPayees(filters?: PayeeFilters): Promise<PayeeListResult> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filtered = [...this.payees];

    if (filters?.type && filters.type !== "all") {
      filtered = filtered.filter((p) => p.type === filters.type);
    }
    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((p) => p.status === filters.status);
    }
    if (filters?.verificationStatus && filters.verificationStatus !== "all") {
      filtered = filtered.filter((p) => p.verificationStatus === filters.verificationStatus);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.dba?.toLowerCase().includes(searchLower) ||
          p.email?.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;
    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? 50;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      payees: paginated,
      total,
      hasMore: offset + paginated.length < total,
    };
  }

  async createPayee(params: CreatePayeeParams): Promise<Payee> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const newPayee: Payee = {
      id: `payee-${Date.now()}`,
      name: params.name,
      dba: params.dba,
      type: params.type,
      status: "ACTIVE",
      verificationStatus: "UNVERIFIED",
      email: params.email,
      vendorId: params.vendorId,
      entityAlias: params.entityAlias,
      defaultCurrency: params.defaultCurrency ?? "USD",
      defaultWalletAddress: params.defaultWalletAddress,
      linkedBusinessId: params.linkedBusinessId,
      linkedInvestorId: params.linkedInvestorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.payees.push(newPayee);
    return newPayee;
  }

  async updatePayee(id: string, updates: Partial<CreatePayeeParams>): Promise<Payee> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const index = this.payees.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Payee not found: ${id}`);
    }

    this.payees[index] = {
      ...this.payees[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.payees[index];
  }

  async updatePayeeStatus(id: string, status: PayeeStatus): Promise<Payee> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const index = this.payees.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Payee not found: ${id}`);
    }

    this.payees[index] = {
      ...this.payees[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    return this.payees[index];
  }

  async updatePayeeVerification(id: string, verificationStatus: PayeeVerificationStatus): Promise<Payee> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const index = this.payees.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Payee not found: ${id}`);
    }

    this.payees[index] = {
      ...this.payees[index],
      verificationStatus,
      updatedAt: new Date().toISOString(),
    };

    return this.payees[index];
  }
}

// Singleton instance
export const mockPayeeRepository = new MockPayeeRepository();
