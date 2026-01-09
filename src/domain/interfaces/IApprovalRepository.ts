import { Role } from "@/types/tokenization";

/**
 * Action types that require multi-role approval
 */
export type ApprovalActionType =
  | "WALLET_PROVISION"
  | "WALLET_SUSPEND"
  | "WALLET_ARCHIVE"
  | "TOKEN_ISSUE"
  | "TOKEN_MINT"
  | "TOKEN_BURN"
  | "TOKEN_FREEZE"
  | "TOKEN_CLAWBACK"
  | "ESCROW_CREATE"
  | "ESCROW_FINISH"
  | "ESCROW_CANCEL"
  | "TRANSFER"
  | "SIGNER_LIST_UPDATE";

/**
 * Entity types that can have approval requests
 */
export type ApprovalEntityType =
  | "WALLET"
  | "TOKEN"
  | "ESCROW"
  | "PAYMENT_CHANNEL"
  | "CHECK";

/**
 * Status of an approval request
 */
export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "EXECUTED"
  | "CANCELLED";

/**
 * Pending approval request
 */
export interface PendingApproval {
  id: string;
  actionType: ApprovalActionType;
  entityType: ApprovalEntityType;
  entityId: string;
  entityName?: string;
  payload: Record<string, unknown>;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: Role;
  requestedAt: string;
  status: ApprovalStatus;
  requiredApprovers: number;
  currentApprovals: number;
  expiresAt: string;
  executedAt?: string;
  executedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

/**
 * Individual approval signature
 */
export interface ApprovalSignature {
  id: string;
  approvalId: string;
  approverId: string;
  approverName: string;
  approverRole: Role;
  approved: boolean;
  signedAt: string;
  notes?: string;
}

/**
 * Parameters for creating an approval request
 */
export interface CreateApprovalParams {
  actionType: ApprovalActionType;
  entityType: ApprovalEntityType;
  entityId: string;
  entityName?: string;
  payload: Record<string, unknown>;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: Role;
  requiredApprovers?: number; // Default: 2
  expiresInHours?: number; // Default: 24
}

/**
 * Parameters for signing an approval
 */
export interface SignApprovalParams {
  approvalId: string;
  approverId: string;
  approverName: string;
  approverRole: Role;
  approved: boolean;
  notes?: string;
}

/**
 * Filters for listing approvals
 */
export interface ApprovalFilters {
  status?: ApprovalStatus | "all";
  entityType?: ApprovalEntityType | "all";
  actionType?: ApprovalActionType | "all";
  requestedBy?: string;
  limit?: number;
  offset?: number;
}

/**
 * Result of listing approvals
 */
export interface ApprovalListResult {
  approvals: PendingApproval[];
  total: number;
  hasMore: boolean;
}

/**
 * Repository interface for approval operations
 */
export interface IApprovalRepository {
  /**
   * Create a new approval request
   */
  createApproval(params: CreateApprovalParams): Promise<PendingApproval>;

  /**
   * Get an approval by ID
   */
  getApproval(approvalId: string): Promise<PendingApproval | null>;

  /**
   * List approvals with optional filters
   */
  listApprovals(filters?: ApprovalFilters): Promise<ApprovalListResult>;

  /**
   * Get pending approvals for the current user to review
   */
  getPendingForReview(userId: string): Promise<PendingApproval[]>;

  /**
   * Add a signature (approve or reject)
   */
  signApproval(params: SignApprovalParams): Promise<ApprovalSignature>;

  /**
   * Get all signatures for an approval
   */
  getSignatures(approvalId: string): Promise<ApprovalSignature[]>;

  /**
   * Mark an approved request as executed
   */
  markExecuted(approvalId: string, executedBy: string): Promise<PendingApproval>;

  /**
   * Cancel a pending approval (by requestor only)
   */
  cancelApproval(approvalId: string, userId: string): Promise<PendingApproval>;
}
