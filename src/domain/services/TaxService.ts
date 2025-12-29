import {
  ITaxRepository,
  ExtendedTaxProfile,
  PayeeFilters,
  PayeeListResult,
  PayeeStats,
  TaxFormSubmission,
  TaxFormType,
  PayoutSummary,
  TaxPackagePreview,
} from "@/domain/interfaces/ITaxRepository";
import { mockTaxRepository } from "@/infra/repositories/mock/MockTaxRepository";
import { auditService } from "./AuditService";
import { TaxFormStatus } from "@/types/reportsAndLogs";
import { Role } from "@/types/tokenization";

/**
 * Tax Service - orchestrates tax/payee operations
 * All access to tax data is logged for compliance
 */
export class TaxService {
  private repository: ITaxRepository;

  constructor(repository?: ITaxRepository) {
    this.repository = repository ?? mockTaxRepository;
  }

  /**
   * List payees with optional filters
   */
  async listPayees(filters: PayeeFilters = {}): Promise<PayeeListResult> {
    return this.repository.listPayees(filters);
  }

  /**
   * Get a payee profile with audit logging
   */
  async getPayeeProfile(
    payeeId: string,
    accessor: { userId: string; name: string; role: Role }
  ): Promise<ExtendedTaxProfile | null> {
    const profile = await this.repository.getPayeeProfile(payeeId);

    if (profile) {
      // Log access to tax profile (RESTRICTED data)
      await auditService.logTaxProfileAccess(
        accessor.userId,
        accessor.name,
        accessor.role,
        payeeId,
        profile.userName,
        ["legalName", "addressJson", "tinLast4"]
      );
    }

    return profile;
  }

  /**
   * Update a payee profile
   */
  async upsertPayeeProfile(
    profile: Partial<ExtendedTaxProfile> & { userId: string },
    actor: { userId: string; name: string; role: Role }
  ): Promise<ExtendedTaxProfile> {
    const existing = await this.repository.getPayeeProfile(profile.userId);
    const updated = await this.repository.upsertPayeeProfile(profile);

    // Log the update
    await auditService.writeEvent({
      entityType: "TAX_PROFILE",
      entityId: profile.userId,
      entityName: updated.userName,
      action: existing ? "UPDATE" : "CREATE",
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      classification: "RESTRICTED",
      beforeState: existing ? { w9Status: existing.w9Status, w8Status: existing.w8Status } : undefined,
      afterState: { w9Status: updated.w9Status, w8Status: updated.w8Status },
    });

    return updated;
  }

  /**
   * Get payee statistics
   */
  async getPayeeStats(): Promise<PayeeStats> {
    return this.repository.getPayeeStats();
  }

  /**
   * Submit or update tax form status
   */
  async submitTaxFormStatus(
    payeeId: string,
    formType: TaxFormType,
    status: TaxFormStatus,
    actor: { userId: string; name: string; role: Role },
    fileUri?: string
  ): Promise<TaxFormSubmission> {
    const profile = await this.repository.getPayeeProfile(payeeId);
    const previousStatus = profile ? (formType === "W9" ? profile.w9Status : profile.w8Status) : "MISSING";

    const submission = await this.repository.submitTaxFormStatus(payeeId, formType, status, fileUri);

    // Log the form status change
    await auditService.writeEvent({
      entityType: "TAX_PROFILE",
      entityId: payeeId,
      entityName: profile?.userName ?? "Unknown",
      action: "UPDATE",
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      classification: "RESTRICTED",
      severity: status === "REJECTED" ? "WARN" : "INFO",
      beforeState: { formType, status: previousStatus },
      afterState: { formType, status, fileUri },
      metadata: {
        submissionId: submission.submissionId,
        formType,
        newStatus: status,
      },
    });

    return submission;
  }

  /**
   * Get tax form submissions for a payee
   */
  async getTaxFormSubmissions(payeeId: string): Promise<TaxFormSubmission[]> {
    return this.repository.getTaxFormSubmissions(payeeId);
  }

  /**
   * Get payout summaries by tax year
   */
  async getPayoutSummariesByYear(
    taxYear: number,
    accessor: { userId: string; name: string; role: Role }
  ): Promise<PayoutSummary[]> {
    // Log access to payout summaries (contains financial data)
    await auditService.writeEvent({
      entityType: "REPORT",
      entityId: `payout-summary-${taxYear}`,
      entityName: `Payout Summaries ${taxYear}`,
      action: "VIEW",
      actorUserId: accessor.userId,
      actorName: accessor.name,
      actorRole: accessor.role,
      classification: "CONFIDENTIAL",
    });

    return this.repository.getPayoutSummariesByYear(taxYear);
  }

  /**
   * Preview tax package for a year
   */
  async previewTaxPackage(
    taxYear: number,
    accessor: { userId: string; name: string; role: Role }
  ): Promise<TaxPackagePreview> {
    // Log access to tax package preview
    await auditService.writeEvent({
      entityType: "REPORT",
      entityId: `tax-package-preview-${taxYear}`,
      entityName: `Tax Package Preview ${taxYear}`,
      action: "VIEW",
      actorUserId: accessor.userId,
      actorName: accessor.name,
      actorRole: accessor.role,
      classification: "RESTRICTED",
      severity: "INFO",
    });

    return this.repository.previewTaxPackage(taxYear);
  }
}

// Default singleton instance using mock repository
export const taxService = new TaxService();
