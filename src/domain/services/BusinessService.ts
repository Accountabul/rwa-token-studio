import { IBusinessRepository } from "@/domain/interfaces/IBusinessRepository";
import { Business, BusinessFilters, BusinessListResult, BusinessStats } from "@/types/business";
import { mockBusinessRepository } from "@/infra/repositories/mock/MockBusinessRepository";
import { auditService } from "./AuditService";
import { Role } from "@/types/tokenization";

/**
 * Business Service - orchestrates business operations
 */
export class BusinessService {
  private repository: IBusinessRepository;

  constructor(repository?: IBusinessRepository) {
    this.repository = repository ?? mockBusinessRepository;
  }

  /**
   * Get a single business by ID
   */
  async getBusiness(id: string): Promise<Business | null> {
    return this.repository.getBusiness(id);
  }

  /**
   * List businesses with optional filters
   */
  async listBusinesses(filters?: BusinessFilters): Promise<BusinessListResult> {
    return this.repository.listBusinesses(filters);
  }

  /**
   * Get businesses owned by a user
   */
  async getBusinessesByOwner(ownerId: string): Promise<Business[]> {
    return this.repository.getBusinessesByOwner(ownerId);
  }

  /**
   * Get business statistics
   */
  async getBusinessStats(): Promise<BusinessStats> {
    return this.repository.getBusinessStats();
  }

  /**
   * Get business by wallet address
   */
  async getBusinessByWallet(walletAddress: string): Promise<Business | null> {
    return this.repository.getBusinessByWallet(walletAddress);
  }

  /**
   * Log a business event to the audit log
   */
  async logBusinessEvent(
    businessId: string,
    businessName: string,
    action: "CREATE" | "UPDATE" | "DELETE" | "LIFECYCLE_TRANSITION",
    actorUserId: string,
    actorName: string,
    actorRole: Role,
    metadata?: Record<string, unknown>
  ) {
    return auditService.writeEvent({
      entityType: "BUSINESS",
      entityId: businessId,
      entityName: businessName,
      action,
      actorUserId,
      actorName,
      actorRole,
      severity: action === "DELETE" ? "WARN" : "INFO",
      classification: "INTERNAL",
      linkedBusinessId: businessId,
      metadata,
    });
  }
}

// Default singleton instance
export const businessService = new BusinessService();
