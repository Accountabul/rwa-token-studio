// ============================================================================
// ENTERPRISE NOTIFICATION SYSTEM - Type Definitions
// ============================================================================

import { Role } from "./tokenization";

// Event types organized by domain
export type NotificationEventType =
  // User Management
  | "user.invited"
  | "user.activated"
  | "user.suspended"
  | "role.assigned"
  | "role.removed"
  | "permission.denied"
  
  // Tokenization
  | "token_project.created"
  | "token_project.status_changed"
  | "token.minted"
  | "token.frozen"
  | "token.unfrozen"
  | "contract.deployment_requested"
  | "batch_tx.submitted"
  | "batch_tx.completed"
  | "batch_tx.failed"
  
  // Compliance
  | "kyc.submitted"
  | "kyc.approved"
  | "kyc.rejected"
  | "compliance.hold_applied"
  | "compliance.hold_released"
  
  // Payments & Finance
  | "escrow.created"
  | "escrow.ready_for_release"
  | "escrow.released"
  | "escrow.cancelled"
  | "payment.failed"
  | "payout.requested"
  | "payout.approved"
  | "payout.rejected"
  
  // Operations
  | "work_order.created"
  | "work_order.assigned"
  | "work_order.updated"
  | "work_order.overdue"
  | "work_order.completed"
  
  // Approvals
  | "approval.requested"
  | "approval.approved"
  | "approval.rejected"
  | "approval.expired"
  
  // System
  | "export.requested"
  | "export.completed"
  | "audit.threshold_triggered";

export type NotificationPriority = "low" | "normal" | "high" | "critical";
export type NotificationStatus = "unread" | "read" | "archived";
export type NotificationChannel = "in_app" | "email" | "sms";
export type RoutingReason = "ASSIGNED" | "DEPARTMENT_LEAD" | "WATCHER" | "MENTIONED" | "ORG_ADMIN";
export type DigestFrequency = "none" | "daily" | "weekly";

// Database notification record
export interface Notification {
  id: string;
  event_type: NotificationEventType;
  entity_type: string;
  entity_id: string;
  entity_name: string | null;
  actor_user_id: string;
  actor_name: string;
  recipient_user_id: string | null;
  recipient_role: Role | null;
  routing_reason: RoutingReason;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  title: string;
  summary: string | null;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  read_at: string | null;
  archived_at: string | null;
}

// User notification preferences
export interface NotificationPreference {
  id: string;
  user_id: string;
  event_type: NotificationEventType;
  in_app_enabled: boolean;
  email_enabled: boolean;
  digest_frequency: DigestFrequency;
  created_at: string;
  updated_at: string;
}

// Entity subscription (watching)
export interface EntitySubscription {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

// Parameters for emitting a notification
export interface EmitNotificationParams {
  eventType: NotificationEventType;
  entityType: string;
  entityId: string;
  entityName?: string;
  actorUserId: string;
  actorName: string;
  title: string;
  summary?: string;
  actionUrl?: string;
  assigneeUserId?: string;
  metadata?: Record<string, unknown>;
}

// Filter options for fetching notifications
export interface NotificationFilters {
  status?: NotificationStatus | "all";
  priority?: NotificationPriority | "all";
  eventType?: NotificationEventType | "all";
  entityType?: string | "all";
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// Notification list result
export interface NotificationListResult {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
  unreadCount: number;
}

// Event type metadata for UI
export interface EventTypeMeta {
  label: string;
  icon: string; // lucide icon name
  category: "user" | "tokenization" | "compliance" | "finance" | "operations" | "approval" | "system";
}

// Event type labels and metadata
export const EVENT_TYPE_META: Partial<Record<NotificationEventType, EventTypeMeta>> = {
  // User Management
  "user.invited": { label: "User Invited", icon: "UserPlus", category: "user" },
  "user.activated": { label: "User Activated", icon: "UserCheck", category: "user" },
  "user.suspended": { label: "User Suspended", icon: "UserX", category: "user" },
  "role.assigned": { label: "Role Assigned", icon: "Shield", category: "user" },
  "role.removed": { label: "Role Removed", icon: "ShieldOff", category: "user" },
  
  // Tokenization
  "token_project.created": { label: "Project Created", icon: "FolderPlus", category: "tokenization" },
  "token_project.status_changed": { label: "Project Updated", icon: "RefreshCw", category: "tokenization" },
  "token.minted": { label: "Token Minted", icon: "Coins", category: "tokenization" },
  "batch_tx.submitted": { label: "Batch Submitted", icon: "Layers", category: "tokenization" },
  "batch_tx.failed": { label: "Batch Failed", icon: "AlertTriangle", category: "tokenization" },
  
  // Compliance
  "kyc.submitted": { label: "KYC Submitted", icon: "FileCheck", category: "compliance" },
  "kyc.approved": { label: "KYC Approved", icon: "CheckCircle", category: "compliance" },
  "kyc.rejected": { label: "KYC Rejected", icon: "XCircle", category: "compliance" },
  
  // Finance
  "escrow.created": { label: "Escrow Created", icon: "Lock", category: "finance" },
  "escrow.ready_for_release": { label: "Escrow Ready", icon: "Unlock", category: "finance" },
  "escrow.released": { label: "Escrow Released", icon: "CheckCircle", category: "finance" },
  "payout.requested": { label: "Payout Requested", icon: "DollarSign", category: "finance" },
  
  // Operations
  "work_order.created": { label: "Work Order Created", icon: "ClipboardList", category: "operations" },
  "work_order.assigned": { label: "Work Order Assigned", icon: "UserCheck", category: "operations" },
  "work_order.overdue": { label: "Work Order Overdue", icon: "AlertCircle", category: "operations" },
  "work_order.completed": { label: "Work Order Completed", icon: "CheckCircle", category: "operations" },
  
  // Approvals
  "approval.requested": { label: "Approval Requested", icon: "Clock", category: "approval" },
  "approval.approved": { label: "Approved", icon: "CheckCircle", category: "approval" },
  "approval.rejected": { label: "Rejected", icon: "XCircle", category: "approval" },
  "approval.expired": { label: "Approval Expired", icon: "Timer", category: "approval" },
};

// Priority colors
export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  high: "text-amber-600 dark:text-amber-400",
  critical: "text-destructive",
};

// Priority badge variants
export const PRIORITY_BADGE_VARIANTS: Record<NotificationPriority, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-primary/10 text-primary",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  critical: "bg-destructive/10 text-destructive",
};
