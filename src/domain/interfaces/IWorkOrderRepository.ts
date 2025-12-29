import { 
  WorkOrder, 
  WorkOrderStatus, 
  WorkOrderFilters, 
  WorkOrderListResult,
  WorkOrderStats,
  CreateWorkOrderParams,
  UpdateWorkOrderParams,
} from "@/types/workOrder";

/**
 * Repository interface for work order operations
 * Implementations: MockWorkOrderRepository, SupabaseWorkOrderRepository
 */
export interface IWorkOrderRepository {
  /**
   * Create a new work order
   */
  createWorkOrder(params: CreateWorkOrderParams): Promise<WorkOrder>;

  /**
   * Get a single work order by ID
   */
  getWorkOrder(id: string): Promise<WorkOrder | null>;

  /**
   * Update a work order
   */
  updateWorkOrder(id: string, params: UpdateWorkOrderParams): Promise<WorkOrder>;

  /**
   * List work orders with optional filters
   */
  listWorkOrders(filters?: WorkOrderFilters): Promise<WorkOrderListResult>;

  /**
   * Update work order status
   */
  updateWorkOrderStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder>;

  /**
   * Get work orders by business
   */
  getWorkOrdersByBusiness(businessId: string): Promise<WorkOrder[]>;

  /**
   * Get work orders by assignee
   */
  getWorkOrdersByAssignee(userId: string): Promise<WorkOrder[]>;

  /**
   * Get work order statistics
   */
  getWorkOrderStats(businessId?: string): Promise<WorkOrderStats>;

  /**
   * Get work order by token ID (NFT or MPT)
   */
  getWorkOrderByToken(tokenId: string): Promise<WorkOrder | null>;
}
