import { ProjectStatus, Role } from "./tokenization";

/**
 * Phase transition rule from database
 */
export interface PhaseTransitionRule {
  id: string;
  from_status: ProjectStatus;
  to_status: ProjectStatus;
  required_roles: Role[];
  required_approvals: number;
  notify_roles: Role[];
  notify_all_users: boolean;
  notify_assignee: boolean;
  description?: string;
  created_at: string;
}

/**
 * Phase approval record from database
 */
export interface PhaseApproval {
  id: string;
  project_id: string;
  from_status: ProjectStatus;
  to_status: ProjectStatus;
  approved_by: string;
  approved_by_name: string;
  approved_by_role: Role;
  approved_at: string;
  notes?: string;
  signature_hash?: string;
}

/**
 * Request to transition a project phase
 */
export interface TransitionRequest {
  projectId: string;
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  notes?: string;
}

/**
 * Result of a transition attempt
 */
export interface TransitionResult {
  success: boolean;
  completed: boolean;
  pendingApprovals: number;
  requiredApprovals: number;
  message?: string;
}

/**
 * Check if user can transition
 */
export interface CanTransitionResult {
  allowed: boolean;
  reason?: string;
  rule?: PhaseTransitionRule;
  currentApprovals: number;
  requiredApprovals: number;
}

/**
 * Database row types
 */
export interface PhaseTransitionRuleRow {
  id: string;
  from_status: string;
  to_status: string;
  required_roles: string[];
  required_approvals: number;
  notify_roles: string[];
  notify_all_users: boolean;
  notify_assignee: boolean;
  description: string | null;
  created_at: string;
}

export interface PhaseApprovalRow {
  id: string;
  project_id: string;
  from_status: string;
  to_status: string;
  approved_by: string;
  approved_by_name: string;
  approved_by_role: string;
  approved_at: string;
  notes: string | null;
  signature_hash: string | null;
}
