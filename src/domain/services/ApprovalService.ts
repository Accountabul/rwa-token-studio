import {
  IApprovalRepository,
  PendingApproval,
  ApprovalSignature,
  CreateApprovalParams,
  ApprovalFilters,
  ApprovalListResult,
  ApprovalActionType,
  ApprovalEntityType,
} from "@/domain/interfaces/IApprovalRepository";
import { supabaseApprovalRepository } from "@/infra/repositories/supabase/SupabaseApprovalRepository";
import { AuditService, auditService } from "./AuditService";
import { Role } from "@/types/tokenization";

/**
 * Actions that require multi-role approval based on the security spec
 */
const HIGH_RISK_ACTIONS: ApprovalActionType[] = [
  "TOKEN_CLAWBACK",
  "TOKEN_FREEZE",
  "TOKEN_BURN",
  "ESCROW_FINISH",
  "ESCROW_CANCEL",
  "TRANSFER",
  "SIGNER_LIST_UPDATE",
];

/**
 * Service for managing multi-role approval workflows
 * Enforces Invariant 2: No unilateral asset movement
 */
export class ApprovalService {
  constructor(
    private readonly repository: IApprovalRepository = supabaseApprovalRepository,
    private readonly audit: AuditService = auditService
  ) {}

  /**
   * Check if an action requires multi-role approval
   */
  requiresApproval(actionType: ApprovalActionType): boolean {
    return HIGH_RISK_ACTIONS.includes(actionType);
  }

  /**
   * Request approval for a high-risk action
   */
  async requestApproval(params: CreateApprovalParams): Promise<PendingApproval> {
    // Create the approval request
    const approval = await this.repository.createApproval(params);

    // Log the request
    await this.audit.writeEvent({
      entityType: "APPROVAL",
      entityId: approval.id,
      entityName: `${params.actionType} on ${params.entityType}`,
      action: "CREATE",
      actorUserId: params.requestedBy,
      actorName: params.requestedByName,
      actorRole: params.requestedByRole,
      severity: "HIGH",
      metadata: {
        actionType: params.actionType,
        entityType: params.entityType,
        entityId: params.entityId,
        requiredApprovers: params.requiredApprovers || 2,
        expiresAt: approval.expiresAt,
      },
    });

    return approval;
  }

  /**
   * Approve a pending request
   */
  async approve(
    approvalId: string,
    approverId: string,
    approverName: string,
    approverRole: Role,
    notes?: string
  ): Promise<{ signature: ApprovalSignature; approval: PendingApproval }> {
    const signature = await this.repository.signApproval({
      approvalId,
      approverId,
      approverName,
      approverRole,
      approved: true,
      notes,
    });

    // Get updated approval status
    const approval = await this.repository.getApproval(approvalId);
    if (!approval) {
      throw new Error("Approval not found after signing");
    }

    // Log the approval
    await this.audit.writeEvent({
      entityType: "APPROVAL",
      entityId: approvalId,
      action: "APPROVE",
      actorUserId: approverId,
      actorName: approverName,
      actorRole: approverRole,
      severity: "HIGH",
      metadata: {
        signatureId: signature.id,
        currentApprovals: approval.currentApprovals,
        requiredApprovers: approval.requiredApprovers,
        newStatus: approval.status,
        notes,
      },
    });

    return { signature, approval };
  }

  /**
   * Reject a pending request
   */
  async reject(
    approvalId: string,
    approverId: string,
    approverName: string,
    approverRole: Role,
    reason: string
  ): Promise<{ signature: ApprovalSignature; approval: PendingApproval }> {
    const signature = await this.repository.signApproval({
      approvalId,
      approverId,
      approverName,
      approverRole,
      approved: false,
      notes: reason,
    });

    // Get updated approval status
    const approval = await this.repository.getApproval(approvalId);
    if (!approval) {
      throw new Error("Approval not found after rejection");
    }

    // Log the rejection
    await this.audit.writeEvent({
      entityType: "APPROVAL",
      entityId: approvalId,
      action: "REJECT",
      actorUserId: approverId,
      actorName: approverName,
      actorRole: approverRole,
      severity: "HIGH",
      metadata: {
        signatureId: signature.id,
        reason,
        newStatus: approval.status,
      },
    });

    return { signature, approval };
  }

  /**
   * Execute an approved action
   */
  async execute(
    approvalId: string,
    executorId: string,
    executorName: string,
    executorRole: Role
  ): Promise<PendingApproval> {
    // Verify the approval is ready
    const approval = await this.repository.getApproval(approvalId);
    if (!approval) {
      throw new Error("Approval not found");
    }

    if (approval.status !== "APPROVED") {
      throw new Error(`Cannot execute: status is ${approval.status}`);
    }

    // Mark as executed
    const executed = await this.repository.markExecuted(approvalId, executorId);

    // Log the execution
    await this.audit.writeEvent({
      entityType: "APPROVAL",
      entityId: approvalId,
      action: "EXECUTE",
      actorUserId: executorId,
      actorName: executorName,
      actorRole: executorRole,
      severity: "HIGH",
      metadata: {
        actionType: approval.actionType,
        entityType: approval.entityType,
        entityId: approval.entityId,
        payload: approval.payload,
      },
    });

    return executed;
  }

  /**
   * Cancel a pending approval request (requestor only)
   */
  async cancel(
    approvalId: string,
    userId: string,
    userName: string,
    userRole: Role
  ): Promise<PendingApproval> {
    const cancelled = await this.repository.cancelApproval(approvalId, userId);

    await this.audit.writeEvent({
      entityType: "APPROVAL",
      entityId: approvalId,
      action: "CANCEL",
      actorUserId: userId,
      actorName: userName,
      actorRole: userRole,
      severity: "INFO",
    });

    return cancelled;
  }

  /**
   * Get an approval with its signatures
   */
  async getApprovalWithSignatures(
    approvalId: string
  ): Promise<{ approval: PendingApproval; signatures: ApprovalSignature[] } | null> {
    const approval = await this.repository.getApproval(approvalId);
    if (!approval) return null;

    const signatures = await this.repository.getSignatures(approvalId);
    return { approval, signatures };
  }

  /**
   * List approvals with filters
   */
  async listApprovals(filters?: ApprovalFilters): Promise<ApprovalListResult> {
    return this.repository.listApprovals(filters);
  }

  /**
   * Get pending approvals for a user to review
   */
  async getPendingForReview(userId: string): Promise<PendingApproval[]> {
    return this.repository.getPendingForReview(userId);
  }

  /**
   * Get all signatures for an approval
   */
  async getSignatures(approvalId: string): Promise<ApprovalSignature[]> {
    return this.repository.getSignatures(approvalId);
  }
}

// Export singleton instance
export const approvalService = new ApprovalService();
