import {
  PayoutRequest,
  PayoutRequestStatus,
  EvidenceDocument,
  PayoutApprovalEvent,
  PaymentMethod,
  PayoutCurrency,
  CheckRequestDetails,
  EvidenceType,
} from "@/types/payout";
import { EarningCategory } from "@/types/reportsAndLogs";
import { Role } from "@/types/tokenization";

/**
 * Filters for listing payout requests
 */
export interface PayoutRequestFilters {
  status?: PayoutRequestStatus | "all";
  paymentMethod?: PaymentMethod | "all";
  currency?: PayoutCurrency | "all";
  requesterId?: string;
  payeeId?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * Result of listing payout requests
 */
export interface PayoutRequestListResult {
  requests: PayoutRequest[];
  total: number;
  hasMore: boolean;
}

/**
 * Parameters for creating a payout request
 */
export interface CreatePayoutRequestParams {
  requesterId: string;
  requesterName: string;
  requesterRole: Role;
  payeeId: string;
  payeeNameSnapshot: string;
  payeeTypeSnapshot: string;
  payeeVerificationStatus: string;
  amount: number;
  currency: PayoutCurrency;
  paymentMethod: PaymentMethod;
  category: EarningCategory;
  memo: string;
  costCenter?: string;
  projectId?: string;
  referenceId?: string;
  destinationWalletAddress?: string;
  neededByDate?: string;
  checkDetails?: CheckRequestDetails;
}

/**
 * Parameters for creating an evidence document
 */
export interface CreateEvidenceParams {
  type: EvidenceType;
  url?: string;
  filename?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedByName: string;
}

/**
 * Parameters for creating an approval event
 */
export interface CreateApprovalEventParams {
  payoutRequestId: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: PayoutApprovalEvent["action"];
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Repository interface for payout request operations
 */
export interface IPayoutRequestRepository {
  /**
   * Create a new payout request (draft or submitted)
   */
  createRequest(params: CreatePayoutRequestParams): Promise<PayoutRequest>;

  /**
   * Get a payout request by ID
   */
  getRequest(id: string): Promise<PayoutRequest | null>;

  /**
   * List payout requests with filters
   */
  listRequests(filters?: PayoutRequestFilters): Promise<PayoutRequestListResult>;

  /**
   * Update a payout request status
   */
  updateRequestStatus(
    id: string,
    status: PayoutRequestStatus,
    metadata?: {
      approverId?: string;
      approverName?: string;
      rejectionReason?: string;
      executedBy?: string;
      executionReference?: string;
    }
  ): Promise<PayoutRequest>;

  /**
   * Get pending approval requests (for finance approvers)
   */
  getPendingApprovals(): Promise<PayoutRequest[]>;

  /**
   * Get requests by approver (historical)
   */
  getRequestsByApprover(approverId: string): Promise<PayoutRequest[]>;

  /**
   * Add evidence document to a request
   */
  addEvidence(requestId: string, evidence: CreateEvidenceParams): Promise<EvidenceDocument>;

  /**
   * Get all evidence for a request
   */
  getEvidenceByRequest(requestId: string): Promise<EvidenceDocument[]>;

  /**
   * Record an approval event
   */
  recordApprovalEvent(params: CreateApprovalEventParams): Promise<PayoutApprovalEvent>;

  /**
   * Get approval history for a request
   */
  getApprovalHistory(requestId: string): Promise<PayoutApprovalEvent[]>;

  /**
   * Delete a draft request
   */
  deleteDraft(id: string): Promise<void>;
}
