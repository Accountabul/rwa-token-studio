import { supabase } from "@/integrations/supabase/client";
import {
  IApprovalRepository,
  PendingApproval,
  ApprovalSignature,
  CreateApprovalParams,
  SignApprovalParams,
  ApprovalFilters,
  ApprovalListResult,
  ApprovalStatus,
} from "@/domain/interfaces/IApprovalRepository";
import { Role } from "@/types/tokenization";

/**
 * Map database row to PendingApproval domain object
 */
function mapRowToApproval(row: Record<string, unknown>): PendingApproval {
  return {
    id: row.id as string,
    actionType: row.action_type as PendingApproval["actionType"],
    entityType: row.entity_type as PendingApproval["entityType"],
    entityId: row.entity_id as string,
    entityName: row.entity_name as string | undefined,
    payload: (row.payload as Record<string, unknown>) || {},
    requestedBy: row.requested_by as string,
    requestedByName: row.requested_by_name as string,
    requestedByRole: row.requested_by_role as Role,
    requestedAt: row.requested_at as string,
    status: row.status as ApprovalStatus,
    requiredApprovers: row.required_approvers as number,
    currentApprovals: row.current_approvals as number,
    expiresAt: row.expires_at as string,
    executedAt: row.executed_at as string | undefined,
    executedBy: row.executed_by as string | undefined,
    rejectionReason: row.rejection_reason as string | undefined,
    createdAt: row.created_at as string,
  };
}

/**
 * Map database row to ApprovalSignature domain object
 */
function mapRowToSignature(row: Record<string, unknown>): ApprovalSignature {
  return {
    id: row.id as string,
    approvalId: row.approval_id as string,
    approverId: row.approver_id as string,
    approverName: row.approver_name as string,
    approverRole: row.approver_role as Role,
    approved: row.approved as boolean,
    signedAt: row.signed_at as string,
    notes: row.notes as string | undefined,
  };
}

/**
 * Supabase implementation of the approval repository
 */
export class SupabaseApprovalRepository implements IApprovalRepository {
  async createApproval(params: CreateApprovalParams): Promise<PendingApproval> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (params.expiresInHours || 24));

    // Use type assertion to bypass strict typing since these columns exist in DB
    const insertData = {
      action_type: params.actionType,
      entity_type: params.entityType,
      entity_id: params.entityId,
      entity_name: params.entityName,
      payload: params.payload,
      requested_by: params.requestedBy,
      requested_by_name: params.requestedByName,
      requested_by_role: params.requestedByRole,
      required_approvers: params.requiredApprovers || 2,
      expires_at: expiresAt.toISOString(),
    };

    const { data, error } = await supabase
      .from("pending_approvals")
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create approval: ${error.message}`);
    }

    return mapRowToApproval(data as Record<string, unknown>);
  }

  async getApproval(approvalId: string): Promise<PendingApproval | null> {
    const { data, error } = await supabase
      .from("pending_approvals")
      .select("*")
      .eq("id", approvalId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get approval: ${error.message}`);
    }

    return data ? mapRowToApproval(data as Record<string, unknown>) : null;
  }

  async listApprovals(filters?: ApprovalFilters): Promise<ApprovalListResult> {
    let query = supabase.from("pending_approvals").select("*", { count: "exact" });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters?.entityType && filters.entityType !== "all") {
      query = query.eq("entity_type", filters.entityType);
    }
    if (filters?.actionType && filters.actionType !== "all") {
      query = query.eq("action_type", filters.actionType);
    }
    if (filters?.requestedBy) {
      query = query.eq("requested_by", filters.requestedBy);
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list approvals: ${error.message}`);
    }

    const approvals = (data || []).map((row) =>
      mapRowToApproval(row as Record<string, unknown>)
    );

    return {
      approvals,
      total: count || 0,
      hasMore: (count || 0) > offset + approvals.length,
    };
  }

  async getPendingForReview(userId: string): Promise<PendingApproval[]> {
    // Get pending approvals that the user hasn't signed yet
    // and didn't request themselves
    const { data, error } = await supabase
      .from("pending_approvals")
      .select("*")
      .eq("status", "PENDING")
      .neq("requested_by", userId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get pending approvals: ${error.message}`);
    }

    // Filter out ones the user has already signed
    const approvals = (data || []).map((row) =>
      mapRowToApproval(row as Record<string, unknown>)
    );

    // Get user's existing signatures
    const { data: signatures } = await supabase
      .from("approval_signatures")
      .select("approval_id")
      .eq("approver_id", userId);

    const signedIds = new Set((signatures || []).map((s) => s.approval_id));

    return approvals.filter((a) => !signedIds.has(a.id));
  }

  async signApproval(params: SignApprovalParams): Promise<ApprovalSignature> {
    const { data, error } = await supabase
      .from("approval_signatures")
      .insert({
        approval_id: params.approvalId,
        approver_id: params.approverId,
        approver_name: params.approverName,
        approver_role: params.approverRole,
        approved: params.approved,
        notes: params.notes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to sign approval: ${error.message}`);
    }

    return mapRowToSignature(data as Record<string, unknown>);
  }

  async getSignatures(approvalId: string): Promise<ApprovalSignature[]> {
    const { data, error } = await supabase
      .from("approval_signatures")
      .select("*")
      .eq("approval_id", approvalId)
      .order("signed_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to get signatures: ${error.message}`);
    }

    return (data || []).map((row) =>
      mapRowToSignature(row as Record<string, unknown>)
    );
  }

  async markExecuted(approvalId: string, executedBy: string): Promise<PendingApproval> {
    const { data, error } = await supabase
      .from("pending_approvals")
      .update({
        status: "EXECUTED",
        executed_at: new Date().toISOString(),
        executed_by: executedBy,
      })
      .eq("id", approvalId)
      .eq("status", "APPROVED") // Can only execute approved requests
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark as executed: ${error.message}`);
    }

    return mapRowToApproval(data as Record<string, unknown>);
  }

  async cancelApproval(approvalId: string, userId: string): Promise<PendingApproval> {
    const { data, error } = await supabase
      .from("pending_approvals")
      .update({ status: "CANCELLED" })
      .eq("id", approvalId)
      .eq("requested_by", userId) // Only requestor can cancel
      .eq("status", "PENDING") // Can only cancel pending
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel approval: ${error.message}`);
    }

    return mapRowToApproval(data as Record<string, unknown>);
  }
}

// Export singleton instance
export const supabaseApprovalRepository = new SupabaseApprovalRepository();
