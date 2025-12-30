import { Payee, PayeeVerificationStatus } from "@/types/payout";
import { IPayeeRepository } from "@/domain/interfaces/IPayeeRepository";
import { mockPayeeRepository } from "@/infra/repositories/mock/MockPayeeRepository";

/**
 * Service for payee-related operations
 */
export class PayeeService {
  constructor(private readonly repo: IPayeeRepository) {}

  /**
   * Search payees by query (for typeahead)
   */
  async searchPayees(query: string, limit: number = 10): Promise<Payee[]> {
    if (query.length < 2) {
      return [];
    }
    return this.repo.searchPayees(query, limit);
  }

  /**
   * Get a payee by ID
   */
  async getPayee(id: string): Promise<Payee | null> {
    return this.repo.getPayee(id);
  }

  /**
   * Validate a payee for payout eligibility
   */
  validatePayee(payee: Payee): { valid: boolean; warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (payee.status === "INACTIVE") {
      errors.push("Payee is inactive and cannot receive payouts");
    }

    if (payee.verificationStatus === "UNVERIFIED") {
      warnings.push("Payee is not verified. Additional review may be required.");
    }

    if (payee.verificationStatus === "PENDING") {
      warnings.push("Payee verification is pending. Proceed with caution.");
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Check if payee requires re-authentication for payouts
   */
  requiresReAuthForPayee(payee: Payee): boolean {
    // Require re-auth for unverified or pending payees
    return (
      payee.verificationStatus === "UNVERIFIED" ||
      payee.verificationStatus === "PENDING"
    );
  }
}

// Singleton instance using mock repository
export const payeeService = new PayeeService(mockPayeeRepository);
