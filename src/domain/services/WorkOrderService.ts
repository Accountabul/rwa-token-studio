import { IWorkOrderRepository } from "@/domain/interfaces/IWorkOrderRepository";
import { 
  WorkOrder, 
  WorkOrderStatus, 
  WorkOrderFilters, 
  WorkOrderListResult,
  WorkOrderStats,
  CreateWorkOrderParams,
} from "@/types/workOrder";
import { mockWorkOrderRepository } from "@/infra/repositories/mock/MockWorkOrderRepository";
import { auditService } from "./AuditService";
import { ledgerService } from "./LedgerService";
import { Role } from "@/types/tokenization";

/**
 * Work Order Service - orchestrates work order operations
 * Handles NFT/MPT creation, assignment, completion, and payment
 */
export class WorkOrderService {
  private repository: IWorkOrderRepository;

  constructor(repository?: IWorkOrderRepository) {
    this.repository = repository ?? mockWorkOrderRepository;
  }

  /**
   * Create a new work order
   * Creates audit event and optionally mints NFT/MPT
   */
  async createWorkOrder(
    params: CreateWorkOrderParams,
    actor: { userId: string; name: string; role: Role }
  ): Promise<WorkOrder> {
    const workOrder = await this.repository.createWorkOrder(params);

    // Log audit event
    await auditService.writeEvent({
      entityType: "WORK_ORDER",
      entityId: workOrder.id,
      entityName: workOrder.title,
      action: "CREATE",
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      severity: "INFO",
      classification: "INTERNAL",
      linkedBusinessId: workOrder.businessId,
      linkedWorkOrderId: workOrder.id,
      xrplTxHash: workOrder.xrplTxHash,
      metadata: {
        tokenType: workOrder.tokenType,
        agreedAmountUsd: workOrder.agreedAmountUsd,
      },
    });

    return workOrder;
  }

  /**
   * Get a single work order by ID
   */
  async getWorkOrder(id: string): Promise<WorkOrder | null> {
    return this.repository.getWorkOrder(id);
  }

  /**
   * List work orders with optional filters
   */
  async listWorkOrders(filters?: WorkOrderFilters): Promise<WorkOrderListResult> {
    return this.repository.listWorkOrders(filters);
  }

  /**
   * Assign a work order to a user
   */
  async assignWorkOrder(
    workOrderId: string,
    assigneeUserId: string,
    assigneeName: string,
    assigneeWalletAddress: string,
    actor: { userId: string; name: string; role: Role }
  ): Promise<WorkOrder> {
    const workOrder = await this.repository.updateWorkOrder(workOrderId, {
      assigneeUserId,
      assigneeName,
      assigneeWalletAddress,
      status: "ACTIVE",
    });

    // Log audit event
    await auditService.writeEvent({
      entityType: "WORK_ORDER",
      entityId: workOrder.id,
      entityName: workOrder.title,
      action: "ASSIGN",
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      severity: "INFO",
      classification: "INTERNAL",
      linkedBusinessId: workOrder.businessId,
      linkedWorkOrderId: workOrder.id,
      linkedInvestorId: assigneeUserId,
      walletAddress: assigneeWalletAddress,
      metadata: {
        assigneeName,
        assigneeWalletAddress,
      },
    });

    return workOrder;
  }

  /**
   * Submit a work order for review (by technician/assignee)
   */
  async submitForReview(
    workOrderId: string,
    actor: { userId: string; name: string; role: Role },
    notes?: string
  ): Promise<WorkOrder> {
    const workOrder = await this.repository.updateWorkOrder(workOrderId, {
      status: "UNDER_REVIEW",
    });

    // Log audit event
    await auditService.writeEvent({
      entityType: "WORK_ORDER",
      entityId: workOrder.id,
      entityName: workOrder.title,
      action: "SUBMIT_FOR_REVIEW",
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      severity: "INFO",
      classification: "INTERNAL",
      linkedBusinessId: workOrder.businessId,
      linkedWorkOrderId: workOrder.id,
      linkedInvestorId: workOrder.assigneeUserId,
      metadata: {
        notes,
      },
    });

    return workOrder;
  }

  /**
   * Review and approve a work order (marks as COMPLETED)
   */
  async reviewWorkOrder(
    workOrderId: string,
    actor: { userId: string; name: string; role: Role },
    reviewNotes?: string
  ): Promise<WorkOrder> {
    const now = new Date().toISOString();
    const workOrder = await this.repository.updateWorkOrder(workOrderId, {
      status: "COMPLETED",
      reviewedAt: now,
      reviewedBy: actor.userId,
      reviewedByName: actor.name,
      reviewNotes,
      completedAt: now,
    });

    // Log audit event
    await auditService.writeEvent({
      entityType: "WORK_ORDER",
      entityId: workOrder.id,
      entityName: workOrder.title,
      action: "REVIEW",
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      severity: "INFO",
      classification: "INTERNAL",
      linkedBusinessId: workOrder.businessId,
      linkedWorkOrderId: workOrder.id,
      linkedInvestorId: workOrder.assigneeUserId,
      walletAddress: workOrder.assigneeWalletAddress,
      metadata: {
        reviewNotes,
        reviewedAt: now,
      },
    });

    return workOrder;
  }

  /**
   * Mark a work order as complete (skip review, direct completion)
   */
  async completeWorkOrder(
    workOrderId: string,
    actor: { userId: string; name: string; role: Role },
    xrplTxHash?: string
  ): Promise<WorkOrder> {
    const workOrder = await this.repository.updateWorkOrderStatus(workOrderId, "COMPLETED");

    // Log audit event
    await auditService.writeEvent({
      entityType: "WORK_ORDER",
      entityId: workOrder.id,
      entityName: workOrder.title,
      action: "COMPLETE",
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      severity: "INFO",
      classification: "INTERNAL",
      linkedBusinessId: workOrder.businessId,
      linkedWorkOrderId: workOrder.id,
      linkedInvestorId: workOrder.assigneeUserId,
      walletAddress: workOrder.assigneeWalletAddress,
      xrplTxHash,
      metadata: {
        completedAt: workOrder.completedAt,
        agreedAmountUsd: workOrder.agreedAmountUsd,
      },
    });

    return workOrder;
  }

  /**
   * Record payment for a work order
   * Creates ledger entry and audit event
   */
  async payWorkOrder(
    workOrderId: string,
    actor: { userId: string; name: string; role: Role },
    paymentDetails: {
      rail: "XRPL" | "STRIPE" | "ACH" | "WIRE";
      processorRef?: string;
      xrplTxHash?: string;
    }
  ): Promise<WorkOrder> {
    const workOrder = await this.repository.getWorkOrder(workOrderId);
    if (!workOrder) {
      throw new Error(`Work order ${workOrderId} not found`);
    }

    // Record ledger entry
    const ledgerEntry = await ledgerService.recordLedgerEvent({
      entryType: "WORK_ORDER_PAYMENT",
      amount: workOrder.agreedAmountUsd,
      currency: workOrder.currency,
      rail: paymentDetails.rail,
      status: "SETTLED",
      payerEntityType: "BUSINESS",
      payerEntityId: workOrder.businessId,
      payerName: workOrder.businessName,
      payeeEntityType: "USER",
      payeeEntityId: workOrder.assigneeUserId ?? "unknown",
      payeeName: workOrder.assigneeName ?? "Unknown",
      xrplTxHash: paymentDetails.xrplTxHash,
      processorRef: paymentDetails.processorRef,
      memo: `Payment for work order: ${workOrder.title}`,
      taxCategory: "NONEMPLOYEE_COMP",
      earningCategory: "WORK_ORDER",
      linkedBusinessId: workOrder.businessId,
      linkedWorkOrderId: workOrder.id,
      linkedInvestorId: workOrder.assigneeUserId,
      payerOfRecord: "BUSINESS",
    });

    // Update work order with payment info
    const updatedWorkOrder = await this.repository.updateWorkOrder(workOrderId, {
      paidAt: new Date().toISOString(),
      paymentLedgerEventId: ledgerEntry.id,
    });

    // Log audit event
    await auditService.writeEvent({
      entityType: "WORK_ORDER",
      entityId: workOrder.id,
      entityName: workOrder.title,
      action: "PAY",
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      severity: "INFO",
      classification: "CONFIDENTIAL",
      linkedBusinessId: workOrder.businessId,
      linkedWorkOrderId: workOrder.id,
      linkedInvestorId: workOrder.assigneeUserId,
      walletAddress: workOrder.assigneeWalletAddress,
      xrplTxHash: paymentDetails.xrplTxHash,
      metadata: {
        amount: workOrder.agreedAmountUsd,
        currency: workOrder.currency,
        rail: paymentDetails.rail,
        ledgerEventId: ledgerEntry.id,
      },
    });

    return updatedWorkOrder;
  }

  /**
   * Get work orders by business
   */
  async getWorkOrdersByBusiness(businessId: string): Promise<WorkOrder[]> {
    return this.repository.getWorkOrdersByBusiness(businessId);
  }

  /**
   * Get work orders by assignee
   */
  async getWorkOrdersByAssignee(userId: string): Promise<WorkOrder[]> {
    return this.repository.getWorkOrdersByAssignee(userId);
  }

  /**
   * Get work order statistics
   */
  async getWorkOrderStats(businessId?: string): Promise<WorkOrderStats> {
    return this.repository.getWorkOrderStats(businessId);
  }

  /**
   * Get work order by token ID
   */
  async getWorkOrderByToken(tokenId: string): Promise<WorkOrder | null> {
    return this.repository.getWorkOrderByToken(tokenId);
  }
}

// Default singleton instance
export const workOrderService = new WorkOrderService();
