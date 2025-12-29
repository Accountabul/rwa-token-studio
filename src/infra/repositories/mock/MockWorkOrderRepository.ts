import { IWorkOrderRepository } from "@/domain/interfaces/IWorkOrderRepository";
import { 
  WorkOrder, 
  WorkOrderStatus, 
  WorkOrderFilters, 
  WorkOrderListResult,
  WorkOrderStats,
  CreateWorkOrderParams,
  UpdateWorkOrderParams,
} from "@/types/workOrder";
import { mockWorkOrders } from "@/data/mockWorkOrders";

/**
 * Mock implementation of IWorkOrderRepository
 */
export class MockWorkOrderRepository implements IWorkOrderRepository {
  private workOrders: WorkOrder[];

  constructor() {
    this.workOrders = [...mockWorkOrders];
  }

  async createWorkOrder(params: CreateWorkOrderParams): Promise<WorkOrder> {
    const newWorkOrder: WorkOrder = {
      id: `wo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      businessId: params.businessId,
      businessName: params.businessName,
      title: params.title,
      description: params.description,
      category: params.category,
      tokenType: params.tokenType,
      tokenId: params.tokenId,
      xrplTxHash: params.xrplTxHash,
      assigneeUserId: params.assigneeUserId,
      assigneeName: params.assigneeName,
      assigneeWalletAddress: params.assigneeWalletAddress,
      agreedAmountUsd: params.agreedAmountUsd,
      currency: params.currency ?? "USD",
      status: "DRAFT",
      createdBy: params.createdBy,
      createdByName: params.createdByName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.workOrders.unshift(newWorkOrder);
    return newWorkOrder;
  }

  async getWorkOrder(id: string): Promise<WorkOrder | null> {
    return this.workOrders.find(wo => wo.id === id) ?? null;
  }

  async updateWorkOrder(id: string, params: UpdateWorkOrderParams): Promise<WorkOrder> {
    const index = this.workOrders.findIndex(wo => wo.id === id);
    if (index === -1) {
      throw new Error(`Work order ${id} not found`);
    }

    this.workOrders[index] = {
      ...this.workOrders[index],
      ...params,
      updatedAt: new Date().toISOString(),
    };

    return this.workOrders[index];
  }

  async listWorkOrders(filters?: WorkOrderFilters): Promise<WorkOrderListResult> {
    let filtered = [...this.workOrders];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(wo =>
        wo.title.toLowerCase().includes(searchLower) ||
        wo.businessName.toLowerCase().includes(searchLower) ||
        wo.assigneeName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter(wo => wo.status === filters.status);
    }

    // Apply business filter
    if (filters?.businessId) {
      filtered = filtered.filter(wo => wo.businessId === filters.businessId);
    }

    // Apply assignee filter
    if (filters?.assigneeUserId) {
      filtered = filtered.filter(wo => wo.assigneeUserId === filters.assigneeUserId);
    }

    // Apply token type filter
    if (filters?.tokenType && filters.tokenType !== "all") {
      filtered = filtered.filter(wo => wo.tokenType === filters.tokenType);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const total = filtered.length;
    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? 50;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      workOrders: paginated,
      total,
      hasMore: offset + paginated.length < total,
    };
  }

  async updateWorkOrderStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder> {
    const workOrder = await this.getWorkOrder(id);
    if (!workOrder) {
      throw new Error(`Work order ${id} not found`);
    }

    const updates: Partial<WorkOrder> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === "COMPLETED") {
      updates.completedAt = new Date().toISOString();
    }

    return this.updateWorkOrder(id, updates);
  }

  async getWorkOrdersByBusiness(businessId: string): Promise<WorkOrder[]> {
    return this.workOrders.filter(wo => wo.businessId === businessId);
  }

  async getWorkOrdersByAssignee(userId: string): Promise<WorkOrder[]> {
    return this.workOrders.filter(wo => wo.assigneeUserId === userId);
  }

  async getWorkOrderStats(businessId?: string): Promise<WorkOrderStats> {
    let orders = this.workOrders;
    if (businessId) {
      orders = orders.filter(wo => wo.businessId === businessId);
    }

    return {
      total: orders.length,
      draft: orders.filter(wo => wo.status === "DRAFT").length,
      active: orders.filter(wo => wo.status === "ACTIVE").length,
      inProgress: orders.filter(wo => wo.status === "IN_PROGRESS").length,
      completed: orders.filter(wo => wo.status === "COMPLETED").length,
      paid: orders.filter(wo => wo.status === "PAID").length,
      totalValueUsd: orders.reduce((sum, wo) => sum + wo.agreedAmountUsd, 0),
      paidValueUsd: orders.filter(wo => wo.paidAt).reduce((sum, wo) => sum + wo.agreedAmountUsd, 0),
    };
  }

  async getWorkOrderByToken(tokenId: string): Promise<WorkOrder | null> {
    return this.workOrders.find(wo => wo.tokenId === tokenId) ?? null;
  }
}

// Singleton instance
export const mockWorkOrderRepository = new MockWorkOrderRepository();
