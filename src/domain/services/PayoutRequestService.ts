import {
  PayoutRequest,
  PayoutRequestStatus,
  EvidenceDocument,
  PayoutApprovalEvent,
  Payee,
  PayoutCurrency,
  isStablecoin,
  ReAuthConfig,
  DEFAULT_REAUTH_CONFIG,
} from "@/types/payout";
import {
  IPayoutRequestRepository,
  CreatePayoutRequestParams,
  CreateEvidenceParams,
} from "@/domain/interfaces/IPayoutRequestRepository";
import { mockPayoutRequestRepository } from "@/infra/repositories/mock/MockPayoutRequestRepository";
import { Role } from "@/types/tokenization";

/**
 * Service for payout request workflow operations
 */
export class PayoutRequestService {
  constructor(
    private readonly repo: IPayoutRequestRepository,
    private readonly reAuthConfig: ReAuthConfig = DEFAULT_REAUTH_CONFIG
  ) {}

  // ============= Core Workflow =============

  /**
   * Create a new payout request draft
   */
  async createDraft(params: CreatePayoutRequestParams): Promise<PayoutRequest> {
    const request = await this.repo.createRequest(params);
    
    // Record creation event
    await this.repo.recordApprovalEvent({
      payoutRequestId: request.id,
      actorId: params.requesterId,
      actorName: params.requesterName,
      actorRole: params.requesterRole,
      action: "CREATE",
    });

    return request;
  }

  /**
   * Submit a payout request for approval
   */
  async submitRequest(
    requestId: string,
    actorId: string,
    actorName: string,
    actorRole: Role,
    reAuthVerified: boolean = false
  ): Promise<PayoutRequest> {
    const request = await this.repo.getRequest(requestId);
    if (!request) {
      throw new Error(`Payout request not found: ${requestId}`);
    }

    if (request.status !== "DRAFT" && request.status !== "SUBMITTED") {
      throw new Error(`Cannot submit request in status: ${request.status}`);
    }

    // Update to submitted (pending approval)
    const updated = await this.repo.updateRequestStatus(requestId, "PENDING_APPROVAL");

    // Record submit event
    await this.repo.recordApprovalEvent({
      payoutRequestId: requestId,
      actorId,
      actorName,
      actorRole,
      action: "SUBMIT",
    });

    // Record re-auth event if verified
    if (reAuthVerified) {
      await this.repo.recordApprovalEvent({
        payoutRequestId: requestId,
        actorId,
        actorName,
        actorRole,
        action: "REAUTH",
        metadata: { method: "password" },
      });
    }

    return updated;
  }

  /**
   * Approve a payout request
   */
  async approveRequest(
    requestId: string,
    approverId: string,
    approverName: string,
    approverRole: Role,
    reason?: string
  ): Promise<PayoutRequest> {
    const request = await this.repo.getRequest(requestId);
    if (!request) {
      throw new Error(`Payout request not found: ${requestId}`);
    }

    // Segregation of duties: requester cannot approve their own request
    if (request.requesterId === approverId) {
      throw new Error("Cannot approve your own payout request");
    }

    if (request.status !== "PENDING_APPROVAL" && request.status !== "SUBMITTED") {
      throw new Error(`Cannot approve request in status: ${request.status}`);
    }

    const updated = await this.repo.updateRequestStatus(requestId, "APPROVED", {
      approverId,
      approverName,
    });

    await this.repo.recordApprovalEvent({
      payoutRequestId: requestId,
      actorId: approverId,
      actorName: approverName,
      actorRole: approverRole,
      action: "APPROVE",
      reason,
    });

    return updated;
  }

  /**
   * Reject a payout request
   */
  async rejectRequest(
    requestId: string,
    approverId: string,
    approverName: string,
    approverRole: Role,
    reason: string
  ): Promise<PayoutRequest> {
    const request = await this.repo.getRequest(requestId);
    if (!request) {
      throw new Error(`Payout request not found: ${requestId}`);
    }

    if (request.status !== "PENDING_APPROVAL" && request.status !== "SUBMITTED") {
      throw new Error(`Cannot reject request in status: ${request.status}`);
    }

    const updated = await this.repo.updateRequestStatus(requestId, "REJECTED", {
      approverId,
      approverName,
      rejectionReason: reason,
    });

    await this.repo.recordApprovalEvent({
      payoutRequestId: requestId,
      actorId: approverId,
      actorName: approverName,
      actorRole: approverRole,
      action: "REJECT",
      reason,
    });

    return updated;
  }

  /**
   * Mark a payout request as paid (after external execution)
   */
  async markAsPaid(
    requestId: string,
    executedBy: string,
    executedByName: string,
    executedByRole: Role,
    executionReference?: string
  ): Promise<PayoutRequest> {
    const request = await this.repo.getRequest(requestId);
    if (!request) {
      throw new Error(`Payout request not found: ${requestId}`);
    }

    if (request.status !== "APPROVED") {
      throw new Error(`Cannot mark as paid - request must be approved first`);
    }

    const updated = await this.repo.updateRequestStatus(requestId, "PAID", {
      executedBy,
      executionReference,
    });

    await this.repo.recordApprovalEvent({
      payoutRequestId: requestId,
      actorId: executedBy,
      actorName: executedByName,
      actorRole: executedByRole,
      action: "MARK_PAID",
      metadata: { executionReference },
    });

    return updated;
  }

  /**
   * Void a payout request
   */
  async voidRequest(
    requestId: string,
    actorId: string,
    actorName: string,
    actorRole: Role,
    reason: string
  ): Promise<PayoutRequest> {
    const request = await this.repo.getRequest(requestId);
    if (!request) {
      throw new Error(`Payout request not found: ${requestId}`);
    }

    // Can only void approved or paid requests
    if (request.status !== "APPROVED" && request.status !== "PAID") {
      throw new Error(`Cannot void request in status: ${request.status}`);
    }

    const updated = await this.repo.updateRequestStatus(requestId, "VOIDED");

    await this.repo.recordApprovalEvent({
      payoutRequestId: requestId,
      actorId,
      actorName,
      actorRole,
      action: "VOID",
      reason,
    });

    return updated;
  }

  // ============= Queries =============

  /**
   * Get pending approval requests
   */
  async getPendingApprovals(): Promise<PayoutRequest[]> {
    return this.repo.getPendingApprovals();
  }

  /**
   * Get a request with its evidence
   */
  async getRequestWithEvidence(requestId: string): Promise<{
    request: PayoutRequest | null;
    evidence: EvidenceDocument[];
    history: PayoutApprovalEvent[];
  }> {
    const [request, evidence, history] = await Promise.all([
      this.repo.getRequest(requestId),
      this.repo.getEvidenceByRequest(requestId),
      this.repo.getApprovalHistory(requestId),
    ]);

    return { request, evidence, history };
  }

  /**
   * Get request by ID
   */
  async getRequest(id: string): Promise<PayoutRequest | null> {
    return this.repo.getRequest(id);
  }

  // ============= Evidence =============

  /**
   * Add evidence link to a request
   */
  async addEvidenceLink(
    requestId: string,
    url: string,
    uploadedBy: string,
    uploadedByName: string
  ): Promise<EvidenceDocument> {
    return this.repo.addEvidence(requestId, {
      type: "LINK",
      url,
      uploadedBy,
      uploadedByName,
    });
  }

  /**
   * Add evidence upload to a request
   */
  async addEvidenceUpload(
    requestId: string,
    filename: string,
    mimeType: string,
    fileSize: number,
    uploadedBy: string,
    uploadedByName: string
  ): Promise<EvidenceDocument> {
    return this.repo.addEvidence(requestId, {
      type: "UPLOAD",
      filename,
      mimeType,
      fileSize,
      uploadedBy,
      uploadedByName,
    });
  }

  /**
   * Get evidence for a request
   */
  async getEvidence(requestId: string): Promise<EvidenceDocument[]> {
    return this.repo.getEvidenceByRequest(requestId);
  }

  // ============= Validation =============

  /**
   * Validate a request before submission
   */
  validateSubmission(
    request: Partial<PayoutRequest>,
    evidence: EvidenceDocument[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.payeeId) {
      errors.push("Payee is required");
    }
    if (!request.amount || request.amount <= 0) {
      errors.push("Valid amount is required");
    }
    if (!request.currency) {
      errors.push("Currency is required");
    }
    if (!request.paymentMethod) {
      errors.push("Payment method is required");
    }
    if (!request.memo || request.memo.trim().length < 10) {
      errors.push("Memo must be at least 10 characters");
    }
    if (evidence.length === 0) {
      errors.push("At least one evidence document is required");
    }

    // Check for crypto-specific validation
    if (request.paymentMethod === "CRYPTO_PAYOUT") {
      if (!request.destinationWalletAddress) {
        errors.push("Destination wallet address is required for crypto payouts");
      }
      if (request.currency && !isStablecoin(request.currency)) {
        errors.push("Stablecoin currency is required for crypto payouts");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if re-authentication is required for this request
   */
  requiresReAuth(request: Partial<PayoutRequest>, payee: Payee | null): boolean {
    // Amount threshold
    if (request.amount && request.amount >= this.reAuthConfig.amountThreshold) {
      return true;
    }

    // Unverified payee
    if (payee && payee.verificationStatus !== "VERIFIED") {
      return true;
    }

    // Stablecoin payout
    if (request.currency && isStablecoin(request.currency)) {
      return true;
    }

    return false;
  }

  /**
   * Get approval history for a request
   */
  async getApprovalHistory(requestId: string): Promise<PayoutApprovalEvent[]> {
    return this.repo.getApprovalHistory(requestId);
  }
}

// Singleton instance using mock repository
export const payoutRequestService = new PayoutRequestService(mockPayoutRequestRepository);
