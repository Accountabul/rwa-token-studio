import {
  IPayoutRequestRepository,
  PayoutRequestFilters,
  PayoutRequestListResult,
  CreatePayoutRequestParams,
  CreateEvidenceParams,
  CreateApprovalEventParams,
} from "@/domain/interfaces/IPayoutRequestRepository";
import {
  PayoutRequest,
  PayoutRequestStatus,
  EvidenceDocument,
  PayoutApprovalEvent,
  PayeeType,
  PayeeVerificationStatus,
} from "@/types/payout";
import {
  mockPayoutRequests,
  mockEvidenceDocuments,
  mockPayoutApprovalEvents,
} from "@/data/mockPayoutRequests";

/**
 * Mock implementation of IPayoutRequestRepository
 */
export class MockPayoutRequestRepository implements IPayoutRequestRepository {
  private requests: PayoutRequest[] = [...mockPayoutRequests];
  private evidence: EvidenceDocument[] = [...mockEvidenceDocuments];
  private events: PayoutApprovalEvent[] = [...mockPayoutApprovalEvents];

  async createRequest(params: CreatePayoutRequestParams): Promise<PayoutRequest> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const newRequest: PayoutRequest = {
      id: `payout-${Date.now()}`,
      requesterId: params.requesterId,
      requesterName: params.requesterName,
      requesterRole: params.requesterRole,
      payeeId: params.payeeId,
      payeeNameSnapshot: params.payeeNameSnapshot,
      payeeTypeSnapshot: params.payeeTypeSnapshot as PayeeType,
      payeeVerificationStatus: params.payeeVerificationStatus as PayeeVerificationStatus,
      amount: params.amount,
      currency: params.currency,
      paymentMethod: params.paymentMethod,
      earningCategory: params.category,
      memo: params.memo,
      costCenter: params.costCenter,
      projectId: params.projectId,
      referenceId: params.referenceId,
      destinationWalletAddress: params.destinationWalletAddress,
      neededByDate: params.neededByDate,
      checkDetails: params.checkDetails,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.requests.push(newRequest);
    return newRequest;
  }

  async getRequest(id: string): Promise<PayoutRequest | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.requests.find((r) => r.id === id) ?? null;
  }

  async listRequests(filters?: PayoutRequestFilters): Promise<PayoutRequestListResult> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filtered = [...this.requests];

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((r) => r.status === filters.status);
    }
    if (filters?.paymentMethod && filters.paymentMethod !== "all") {
      filtered = filtered.filter((r) => r.paymentMethod === filters.paymentMethod);
    }
    if (filters?.currency && filters.currency !== "all") {
      filtered = filtered.filter((r) => r.currency === filters.currency);
    }
    if (filters?.requesterId) {
      filtered = filtered.filter((r) => r.requesterId === filters.requesterId);
    }
    if (filters?.payeeId) {
      filtered = filtered.filter((r) => r.payeeId === filters.payeeId);
    }
    if (filters?.amountMin !== undefined) {
      filtered = filtered.filter((r) => r.amount >= filters.amountMin!);
    }
    if (filters?.amountMax !== undefined) {
      filtered = filtered.filter((r) => r.amount <= filters.amountMax!);
    }
    if (filters?.dateFrom) {
      filtered = filtered.filter((r) => r.createdAt >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      filtered = filtered.filter((r) => r.createdAt <= filters.dateTo!);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? 50;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      requests: paginated,
      total,
      hasMore: offset + paginated.length < total,
    };
  }

  async updateRequestStatus(
    id: string,
    status: PayoutRequestStatus,
    metadata?: {
      approverId?: string;
      approverName?: string;
      rejectionReason?: string;
      executedBy?: string;
      executionReference?: string;
    }
  ): Promise<PayoutRequest> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Payout request not found: ${id}`);
    }

    const now = new Date().toISOString();
    const updates: Partial<PayoutRequest> = {
      status,
      updatedAt: now,
    };

    if (status === "SUBMITTED") {
      updates.submittedAt = now;
    } else if (status === "APPROVED") {
      updates.approverId = metadata?.approverId;
      updates.approverName = metadata?.approverName;
      updates.approvedAt = now;
    } else if (status === "REJECTED") {
      updates.approverId = metadata?.approverId;
      updates.approverName = metadata?.approverName;
      updates.rejectionReason = metadata?.rejectionReason;
    } else if (status === "PAID") {
      updates.executedAt = now;
      updates.executedBy = metadata?.executedBy;
      updates.executionReference = metadata?.executionReference;
    }

    this.requests[index] = {
      ...this.requests[index],
      ...updates,
    };

    return this.requests[index];
  }

  async getPendingApprovals(): Promise<PayoutRequest[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.requests
      .filter((r) => r.status === "PENDING_APPROVAL" || r.status === "SUBMITTED")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRequestsByApprover(approverId: string): Promise<PayoutRequest[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.requests
      .filter((r) => r.approverId === approverId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addEvidence(requestId: string, evidence: CreateEvidenceParams): Promise<EvidenceDocument> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const newEvidence: EvidenceDocument = {
      id: `evidence-${Date.now()}`,
      payoutRequestId: requestId,
      type: evidence.type,
      url: evidence.url,
      storageKey: evidence.type === "UPLOAD" ? `uploads/${Date.now()}-${evidence.filename}` : undefined,
      filename: evidence.filename,
      fileHash: evidence.type === "UPLOAD" ? `sha256-${Math.random().toString(36).substring(2)}` : undefined,
      mimeType: evidence.mimeType,
      fileSize: evidence.fileSize,
      uploadedBy: evidence.uploadedBy,
      uploadedByName: evidence.uploadedByName,
      createdAt: new Date().toISOString(),
    };

    this.evidence.push(newEvidence);
    return newEvidence;
  }

  async getEvidenceByRequest(requestId: string): Promise<EvidenceDocument[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.evidence.filter((e) => e.payoutRequestId === requestId);
  }

  async recordApprovalEvent(params: CreateApprovalEventParams): Promise<PayoutApprovalEvent> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const newEvent: PayoutApprovalEvent = {
      id: `event-${Date.now()}`,
      payoutRequestId: params.payoutRequestId,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      reason: params.reason,
      metadata: params.metadata,
      createdAt: new Date().toISOString(),
    };

    this.events.push(newEvent);
    return newEvent;
  }

  async getApprovalHistory(requestId: string): Promise<PayoutApprovalEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.events
      .filter((e) => e.payoutRequestId === requestId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async deleteDraft(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const request = this.requests.find((r) => r.id === id);
    if (!request) {
      throw new Error(`Payout request not found: ${id}`);
    }
    if (request.status !== "DRAFT") {
      throw new Error("Only draft requests can be deleted");
    }

    this.requests = this.requests.filter((r) => r.id !== id);
    this.evidence = this.evidence.filter((e) => e.payoutRequestId !== id);
    this.events = this.events.filter((e) => e.payoutRequestId !== id);
  }
}

// Singleton instance
export const mockPayoutRequestRepository = new MockPayoutRequestRepository();
