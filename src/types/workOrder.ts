/**
 * Work Order Types
 * Work orders represent business operations tracked as NFTs/MPTs on the XRPL
 */

export type WorkOrderStatus = "DRAFT" | "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "PAID" | "CANCELLED" | "DISPUTED";

export type WorkOrderTokenType = "NFT" | "MPT";

export interface WorkOrder {
  id: string;
  
  // Business context
  businessId: string;
  businessName: string;
  
  // Work order details
  title: string;
  description?: string;
  category?: string;
  
  // Token representation (for on-chain tracking)
  tokenType: WorkOrderTokenType;
  tokenId?: string; // NFT token ID or MPT issuance ID
  xrplTxHash?: string; // Minting transaction hash
  
  // Parties involved
  assigneeUserId?: string;
  assigneeName?: string;
  assigneeWalletAddress?: string;
  
  // Value and payment
  agreedAmountUsd: number;
  currency: string;
  feeAmountUsd?: number;
  netAmountUsd?: number;
  
  // Status tracking
  status: WorkOrderStatus;
  completedAt?: string;
  paidAt?: string;
  paymentLedgerEventId?: string;
  paymentXrplTxHash?: string;
  
  // Audit trail
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderFilters {
  search?: string;
  businessId?: string;
  assigneeUserId?: string;
  status?: WorkOrderStatus | "all";
  tokenType?: WorkOrderTokenType | "all";
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface WorkOrderListResult {
  workOrders: WorkOrder[];
  total: number;
  hasMore: boolean;
}

export interface WorkOrderStats {
  total: number;
  draft: number;
  active: number;
  inProgress: number;
  completed: number;
  paid: number;
  totalValueUsd: number;
  paidValueUsd: number;
}

export interface CreateWorkOrderParams {
  businessId: string;
  title: string;
  description?: string;
  category?: string;
  tokenType: WorkOrderTokenType;
  agreedAmountUsd: number;
  currency?: string;
  assigneeUserId?: string;
  assigneeName?: string;
  assigneeWalletAddress?: string;
  createdBy: string;
  createdByName: string;
}
