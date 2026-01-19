// ============================================================================
// PHASE TRANSITION SERVICE
// Handles tokenization project phase transitions with approval gates
// ============================================================================

import { supabase } from "@/integrations/supabase/client";
import { ProjectStatus, Role, statusOrder, statusLabel } from "@/types/tokenization";
import { 
  PhaseTransitionRule, 
  PhaseApproval, 
  CanTransitionResult, 
  TransitionResult,
  PhaseTransitionRuleRow,
  PhaseApprovalRow
} from "@/types/phaseTransition";
import { NotificationEventType } from "@/types/notifications";

/**
 * Maps project status to notification event type
 */
const STATUS_TO_EVENT: Record<string, NotificationEventType> = {
  "INTAKE_COMPLETE": "token_project.intake_complete",
  "METADATA_DRAFT": "token_project.metadata_draft",
  "METADATA_APPROVED": "token_project.metadata_approved",
  "COMPLIANCE_APPROVED": "token_project.compliance_approved",
  "CUSTODY_READY": "token_project.custody_ready",
  "MINTED": "token_project.minted",
};

export class PhaseTransitionService {
  /**
   * Fetch all transition rules from database
   */
  async getTransitionRules(): Promise<PhaseTransitionRule[]> {
    const { data, error } = await supabase
      .from("project_phase_transitions")
      .select("*")
      .order("from_status");

    if (error) {
      console.error("Error fetching transition rules:", error);
      return [];
    }

    return (data as PhaseTransitionRuleRow[]).map(row => ({
      id: row.id,
      from_status: row.from_status as ProjectStatus,
      to_status: row.to_status as ProjectStatus,
      required_roles: row.required_roles as Role[],
      required_approvals: row.required_approvals,
      notify_roles: row.notify_roles as Role[],
      notify_all_users: row.notify_all_users,
      notify_assignee: row.notify_assignee,
      description: row.description ?? undefined,
      created_at: row.created_at,
    }));
  }

  /**
   * Get transition rule for a specific status change
   */
  async getTransitionRule(
    fromStatus: ProjectStatus,
    toStatus: ProjectStatus
  ): Promise<PhaseTransitionRule | null> {
    const { data, error } = await supabase
      .from("project_phase_transitions")
      .select("*")
      .eq("from_status", fromStatus)
      .eq("to_status", toStatus)
      .single();

    if (error || !data) {
      return null;
    }

    const row = data as PhaseTransitionRuleRow;
    return {
      id: row.id,
      from_status: row.from_status as ProjectStatus,
      to_status: row.to_status as ProjectStatus,
      required_roles: row.required_roles as Role[],
      required_approvals: row.required_approvals,
      notify_roles: row.notify_roles as Role[],
      notify_all_users: row.notify_all_users,
      notify_assignee: row.notify_assignee,
      description: row.description ?? undefined,
      created_at: row.created_at,
    };
  }

  /**
   * Get current approvals for a pending transition
   */
  async getCurrentApprovals(
    projectId: string,
    fromStatus: ProjectStatus,
    toStatus: ProjectStatus
  ): Promise<PhaseApproval[]> {
    const { data, error } = await supabase
      .from("project_phase_approvals")
      .select("*")
      .eq("project_id", projectId)
      .eq("from_status", fromStatus)
      .eq("to_status", toStatus)
      .order("approved_at", { ascending: true });

    if (error) {
      console.error("Error fetching approvals:", error);
      return [];
    }

    return (data as PhaseApprovalRow[]).map(row => ({
      id: row.id,
      project_id: row.project_id,
      from_status: row.from_status as ProjectStatus,
      to_status: row.to_status as ProjectStatus,
      approved_by: row.approved_by,
      approved_by_name: row.approved_by_name,
      approved_by_role: row.approved_by_role as Role,
      approved_at: row.approved_at,
      notes: row.notes ?? undefined,
      signature_hash: row.signature_hash ?? undefined,
    }));
  }

  /**
   * Check if a user can transition a project
   */
  async canTransition(
    projectId: string,
    fromStatus: ProjectStatus,
    toStatus: ProjectStatus,
    userRoles: Role[]
  ): Promise<CanTransitionResult> {
    // Validate it's the next step in sequence
    const fromIndex = statusOrder.indexOf(fromStatus);
    const toIndex = statusOrder.indexOf(toStatus);
    
    if (toIndex !== fromIndex + 1) {
      return {
        allowed: false,
        reason: "Can only advance to the next phase in sequence",
        currentApprovals: 0,
        requiredApprovals: 0,
      };
    }

    // Get transition rule
    const rule = await this.getTransitionRule(fromStatus, toStatus);
    if (!rule) {
      return {
        allowed: false,
        reason: "No transition rule defined for this phase change",
        currentApprovals: 0,
        requiredApprovals: 0,
      };
    }

    // Check if user has required role
    const hasRequiredRole = userRoles.some(role => 
      rule.required_roles.includes(role) || role === "SUPER_ADMIN"
    );

    if (!hasRequiredRole) {
      return {
        allowed: false,
        reason: `Requires one of: ${rule.required_roles.join(", ")}`,
        rule,
        currentApprovals: 0,
        requiredApprovals: rule.required_approvals,
      };
    }

    // Get current approvals
    const currentApprovals = await this.getCurrentApprovals(projectId, fromStatus, toStatus);
    
    return {
      allowed: true,
      rule,
      currentApprovals: currentApprovals.length,
      requiredApprovals: rule.required_approvals,
    };
  }

  /**
   * Submit approval for a phase transition
   */
  async submitApproval(
    projectId: string,
    fromStatus: ProjectStatus,
    toStatus: ProjectStatus,
    userId: string,
    userName: string,
    userRole: Role,
    notes?: string
  ): Promise<TransitionResult> {
    // Get transition rule
    const rule = await this.getTransitionRule(fromStatus, toStatus);
    if (!rule) {
      return {
        success: false,
        completed: false,
        pendingApprovals: 0,
        requiredApprovals: 0,
        message: "No transition rule found",
      };
    }

    // Check if user has required role
    const hasRequiredRole = rule.required_roles.includes(userRole) || userRole === "SUPER_ADMIN";
    if (!hasRequiredRole) {
      return {
        success: false,
        completed: false,
        pendingApprovals: 0,
        requiredApprovals: rule.required_approvals,
        message: `Role ${userRole} is not authorized for this transition`,
      };
    }

    // Check if user already approved
    const existingApprovals = await this.getCurrentApprovals(projectId, fromStatus, toStatus);
    if (existingApprovals.some(a => a.approved_by === userId)) {
      return {
        success: false,
        completed: false,
        pendingApprovals: existingApprovals.length,
        requiredApprovals: rule.required_approvals,
        message: "You have already approved this transition",
      };
    }

    // Insert approval record
    const { error: insertError } = await supabase
      .from("project_phase_approvals")
      .insert({
        project_id: projectId,
        from_status: fromStatus,
        to_status: toStatus,
        approved_by: userId,
        approved_by_name: userName,
        approved_by_role: userRole,
        notes: notes || null,
      });

    if (insertError) {
      console.error("Error inserting approval:", insertError);
      return {
        success: false,
        completed: false,
        pendingApprovals: existingApprovals.length,
        requiredApprovals: rule.required_approvals,
        message: "Failed to record approval",
      };
    }

    const newApprovalCount = existingApprovals.length + 1;
    const isComplete = newApprovalCount >= rule.required_approvals;

    // If threshold met, update project status
    if (isComplete) {
      const { error: updateError } = await supabase
        .from("tokenization_projects")
        .update({ status: toStatus })
        .eq("id", projectId);

      if (updateError) {
        console.error("Error updating project status:", updateError);
        return {
          success: true,
          completed: false,
          pendingApprovals: newApprovalCount,
          requiredApprovals: rule.required_approvals,
          message: "Approval recorded but failed to update project status",
        };
      }

      // Emit notifications (would integrate with NotificationService)
      await this.emitTransitionNotifications(projectId, toStatus, rule, userName);
    }

    return {
      success: true,
      completed: isComplete,
      pendingApprovals: newApprovalCount,
      requiredApprovals: rule.required_approvals,
      message: isComplete 
        ? `Project advanced to ${statusLabel[toStatus]}` 
        : `Approval recorded (${newApprovalCount}/${rule.required_approvals})`,
    };
  }

  /**
   * Get approval history for a project
   */
  async getApprovalHistory(projectId: string): Promise<PhaseApproval[]> {
    const { data, error } = await supabase
      .from("project_phase_approvals")
      .select("*")
      .eq("project_id", projectId)
      .order("approved_at", { ascending: true });

    if (error) {
      console.error("Error fetching approval history:", error);
      return [];
    }

    return (data as PhaseApprovalRow[]).map(row => ({
      id: row.id,
      project_id: row.project_id,
      from_status: row.from_status as ProjectStatus,
      to_status: row.to_status as ProjectStatus,
      approved_by: row.approved_by,
      approved_by_name: row.approved_by_name,
      approved_by_role: row.approved_by_role as Role,
      approved_at: row.approved_at,
      notes: row.notes ?? undefined,
      signature_hash: row.signature_hash ?? undefined,
    }));
  }

  /**
   * Emit notifications for a completed phase transition
   */
  private async emitTransitionNotifications(
    projectId: string,
    toStatus: ProjectStatus,
    rule: PhaseTransitionRule,
    actorName: string
  ): Promise<void> {
    const eventType = STATUS_TO_EVENT[toStatus];
    if (!eventType) return;

    // For platform-wide notifications (MINTED status)
    if (rule.notify_all_users) {
      // Fetch all users and create notifications
      const { data: users } = await supabase
        .from("profiles")
        .select("id");

      if (users && users.length > 0) {
        // This would be handled by NotificationService.emit() with notifyAllUsers flag
        console.log(`Platform-wide notification: New token offering from project ${projectId}`);
      }
    }

    // Notify specific roles
    if (rule.notify_roles.length > 0) {
      console.log(`Notifying roles: ${rule.notify_roles.join(", ")} about ${eventType}`);
    }
  }

  /**
   * Get the next valid status for a project
   */
  getNextStatus(currentStatus: ProjectStatus): ProjectStatus | null {
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= statusOrder.length - 1) {
      return null;
    }
    return statusOrder[currentIndex + 1];
  }
}

// Export singleton instance
export const phaseTransitionService = new PhaseTransitionService();
