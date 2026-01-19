// ============================================================================
// NOTIFICATION ROUTING CONFIGURATION
// Maps event types to recipient roles and routing rules
// ============================================================================

import { NotificationEventType, NotificationPriority } from "@/types/notifications";
import { Role } from "@/types/tokenization";

export interface RoutingRule {
  eventType: NotificationEventType;
  priority: NotificationPriority;
  departmentRoles: Role[];      // Department leads to notify
  notifyAssignee: boolean;      // Notify assignee if present
  notifyWatchers: boolean;      // Notify entity watchers
  notifyOrgAdmins: boolean;     // For critical events
  notifyAllUsers?: boolean;     // For platform-wide broadcasts (e.g., new token offerings)
}

export const ROUTING_RULES: RoutingRule[] = [
  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================
  {
    eventType: "user.invited",
    priority: "normal",
    departmentRoles: ["HIRING_MANAGER"],
    notifyAssignee: false,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "user.activated",
    priority: "normal",
    departmentRoles: ["HIRING_MANAGER", "SYSTEM_ADMIN"],
    notifyAssignee: true, // The user who was activated
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "user.suspended",
    priority: "high",
    departmentRoles: ["SYSTEM_ADMIN"],
    notifyAssignee: true, // The suspended user
    notifyWatchers: false,
    notifyOrgAdmins: true,
  },
  {
    eventType: "role.assigned",
    priority: "high",
    departmentRoles: ["SYSTEM_ADMIN"],
    notifyAssignee: true, // The user who received the role
    notifyWatchers: false,
    notifyOrgAdmins: true,
  },
  {
    eventType: "role.removed",
    priority: "high",
    departmentRoles: ["SYSTEM_ADMIN"],
    notifyAssignee: true,
    notifyWatchers: false,
    notifyOrgAdmins: true,
  },
  {
    eventType: "permission.denied",
    priority: "normal",
    departmentRoles: ["SECURITY_ENGINEER"],
    notifyAssignee: false,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },

  // ============================================================================
  // TOKENIZATION
  // ============================================================================
  {
    eventType: "token_project.created",
    priority: "normal",
    departmentRoles: ["TOKENIZATION_MANAGER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "token_project.status_changed",
    priority: "normal",
    departmentRoles: ["TOKENIZATION_MANAGER", "VALUATION_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  // Phase Transition Events
  {
    eventType: "token_project.intake_complete",
    priority: "normal",
    departmentRoles: ["VALUATION_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "token_project.metadata_draft",
    priority: "normal",
    departmentRoles: ["VALUATION_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "token_project.metadata_approved",
    priority: "high",
    departmentRoles: ["COMPLIANCE_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "token_project.compliance_approved",
    priority: "high",
    departmentRoles: ["CUSTODY_OFFICER", "RISK_ANALYST"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "token_project.custody_ready",
    priority: "high",
    departmentRoles: ["TOKENIZATION_MANAGER", "FINANCE_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "token_project.minted",
    priority: "critical",
    departmentRoles: [],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: true,
    notifyAllUsers: true, // Platform-wide broadcast
  },
  {
    eventType: "token_project.new_offering",
    priority: "critical",
    departmentRoles: [],
    notifyAssignee: false,
    notifyWatchers: false,
    notifyOrgAdmins: false,
    notifyAllUsers: true, // Platform-wide broadcast
  },
  {
    eventType: "token_project.approval_required",
    priority: "high",
    departmentRoles: [], // Dynamic based on transition rules
    notifyAssignee: false,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "token.minted",
    priority: "high",
    departmentRoles: ["TOKENIZATION_MANAGER", "CUSTODY_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "token.frozen",
    priority: "high",
    departmentRoles: ["COMPLIANCE_OFFICER", "TOKENIZATION_MANAGER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: true,
  },
  {
    eventType: "token.unfrozen",
    priority: "normal",
    departmentRoles: ["COMPLIANCE_OFFICER", "TOKENIZATION_MANAGER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "batch_tx.submitted",
    priority: "normal",
    departmentRoles: ["TOKENIZATION_MANAGER"],
    notifyAssignee: true,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "batch_tx.completed",
    priority: "normal",
    departmentRoles: [],
    notifyAssignee: true,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "batch_tx.failed",
    priority: "critical",
    departmentRoles: ["TOKENIZATION_MANAGER", "CUSTODY_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: false,
    notifyOrgAdmins: true,
  },

  // ============================================================================
  // COMPLIANCE
  // ============================================================================
  {
    eventType: "kyc.submitted",
    priority: "normal",
    departmentRoles: ["COMPLIANCE_OFFICER"],
    notifyAssignee: false,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "kyc.approved",
    priority: "normal",
    departmentRoles: ["COMPLIANCE_OFFICER", "INVESTOR_OPERATIONS"],
    notifyAssignee: true, // The investor
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "kyc.rejected",
    priority: "high",
    departmentRoles: ["COMPLIANCE_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "compliance.hold_applied",
    priority: "high",
    departmentRoles: ["COMPLIANCE_OFFICER", "RISK_ANALYST"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: true,
  },
  {
    eventType: "compliance.hold_released",
    priority: "normal",
    departmentRoles: ["COMPLIANCE_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },

  // ============================================================================
  // PAYMENTS & FINANCE
  // ============================================================================
  {
    eventType: "escrow.created",
    priority: "normal",
    departmentRoles: ["CUSTODY_OFFICER", "FINANCE_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "escrow.ready_for_release",
    priority: "high",
    departmentRoles: ["CUSTODY_OFFICER", "FINANCE_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "escrow.released",
    priority: "normal",
    departmentRoles: ["FINANCE_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "escrow.cancelled",
    priority: "high",
    departmentRoles: ["CUSTODY_OFFICER", "FINANCE_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "payment.failed",
    priority: "critical",
    departmentRoles: ["FINANCE_OFFICER", "ACCOUNTING_MANAGER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: true,
  },
  {
    eventType: "payout.requested",
    priority: "normal",
    departmentRoles: ["FINANCE_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "payout.approved",
    priority: "normal",
    departmentRoles: [],
    notifyAssignee: true, // The requester
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "payout.rejected",
    priority: "high",
    departmentRoles: [],
    notifyAssignee: true,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },

  // ============================================================================
  // OPERATIONS / WORK ORDERS
  // ============================================================================
  {
    eventType: "work_order.created",
    priority: "normal",
    departmentRoles: ["PROPERTY_OPERATIONS_MANAGER", "OPERATIONS_ADMIN"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "work_order.assigned",
    priority: "normal",
    departmentRoles: ["PROPERTY_OPERATIONS_MANAGER"],
    notifyAssignee: true, // The assigned technician/vendor
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "work_order.updated",
    priority: "low",
    departmentRoles: [],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "work_order.overdue",
    priority: "critical",
    departmentRoles: ["PROPERTY_OPERATIONS_MANAGER", "OPERATIONS_ADMIN", "FINANCE_OFFICER"],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: true,
  },
  {
    eventType: "work_order.completed",
    priority: "normal",
    departmentRoles: ["PROPERTY_OPERATIONS_MANAGER"],
    notifyAssignee: false,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },

  // ============================================================================
  // APPROVALS
  // ============================================================================
  {
    eventType: "approval.requested",
    priority: "high",
    departmentRoles: [], // Routed to specific approvers via assignee
    notifyAssignee: true,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "approval.approved",
    priority: "normal",
    departmentRoles: [],
    notifyAssignee: true, // The requester
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "approval.rejected",
    priority: "high",
    departmentRoles: [],
    notifyAssignee: true,
    notifyWatchers: true,
    notifyOrgAdmins: false,
  },
  {
    eventType: "approval.expired",
    priority: "high",
    departmentRoles: [],
    notifyAssignee: true,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },

  // ============================================================================
  // SYSTEM / AUDIT
  // ============================================================================
  {
    eventType: "export.requested",
    priority: "normal",
    departmentRoles: ["AUDITOR"],
    notifyAssignee: false,
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "export.completed",
    priority: "low",
    departmentRoles: [],
    notifyAssignee: true, // The requester
    notifyWatchers: false,
    notifyOrgAdmins: false,
  },
  {
    eventType: "audit.threshold_triggered",
    priority: "critical",
    departmentRoles: ["SECURITY_ENGINEER", "COMPLIANCE_OFFICER"],
    notifyAssignee: false,
    notifyWatchers: false,
    notifyOrgAdmins: true,
  },
];

// Helper to get routing rule for an event type
export function getRoutingRule(eventType: NotificationEventType): RoutingRule | undefined {
  return ROUTING_RULES.find(r => r.eventType === eventType);
}

// Helper to get all event types for a category
export function getEventTypesByCategory(category: string): NotificationEventType[] {
  const categoryPrefixes: Record<string, string[]> = {
    user: ["user.", "role.", "permission."],
    tokenization: ["token_project.", "token.", "contract.", "batch_tx."],
    compliance: ["kyc.", "compliance."],
    finance: ["escrow.", "payment.", "payout."],
    operations: ["work_order."],
    approval: ["approval."],
    system: ["export.", "audit."],
  };

  const prefixes = categoryPrefixes[category] || [];
  return ROUTING_RULES
    .filter(r => prefixes.some(p => r.eventType.startsWith(p)))
    .map(r => r.eventType);
}
