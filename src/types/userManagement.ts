// ============================================================================
// ENTERPRISE USER MANAGEMENT TYPES
// ============================================================================

import { Role } from "./tokenization";

// Permission risk levels
export type RiskLevel = "NORMAL" | "ELEVATED" | "DANGEROUS";

// User lifecycle states
export type UserStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "TERMINATED" | "LOCKED";

// Employment types
export type EmploymentType = "EMPLOYEE" | "CONTRACTOR" | "AGENT";

// Access request status
export type AccessRequestStatus = "PENDING" | "APPROVED" | "DENIED" | "EXPIRED" | "CANCELLED";

// Access audit actions
export type AccessAuditAction =
  | "ROLE_ASSIGNED"
  | "ROLE_REVOKED"
  | "ROLE_EXPIRED"
  | "PERMISSION_GRANTED"
  | "PERMISSION_REVOKED"
  | "STATUS_CHANGED"
  | "USER_SUSPENDED"
  | "USER_TERMINATED"
  | "USER_ACTIVATED"
  | "ACCESS_REQUEST_CREATED"
  | "ACCESS_REQUEST_APPROVED"
  | "ACCESS_REQUEST_DENIED"
  | "PASSWORD_RESET"
  | "SESSION_REVOKED"
  | "PROFILE_UPDATED";

// Permission definition
export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  risk_level: RiskLevel;
  requires_justification: boolean;
  requires_approval: boolean;
  created_at: string;
}

// Role permission mapping
export interface RolePermission {
  id: string;
  role: Role;
  permission_id: string;
  granted_at: string;
}

// Extended user profile with employee data
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  department: string | null;
  manager_id: string | null;
  employment_type: EmploymentType;
  job_title: string | null;
  start_date: string | null;
  end_date: string | null;
  status: UserStatus;
  last_login_at: string | null;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
}

// User with roles
export interface UserWithRoles extends UserProfile {
  roles: UserRoleAssignment[];
}

// Role assignment
export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role: Role;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  notes: string | null;
}

// Access request
export interface AccessRequest {
  id: string;
  user_id: string;
  requested_role: Role | null;
  requested_permission_id: string | null;
  justification: string;
  status: AccessRequestStatus;
  requested_at: string;
  expires_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  // Joined data
  user?: UserProfile;
  permission?: Permission;
  reviewer?: UserProfile;
}

// Access audit log entry
export interface AccessAuditEntry {
  id: string;
  user_id: string;
  actor_id: string;
  action: AccessAuditAction;
  role: Role | null;
  permission_code: string | null;
  previous_value: string | null;
  new_value: string | null;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Joined data
  user?: UserProfile;
  actor?: UserProfile;
}

// Grouped permissions by category
export interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

// Role with effective permissions
export interface RoleWithPermissions {
  role: Role;
  label: string;
  permissions: Permission[];
  dangerousCount: number;
  elevatedCount: number;
}

// Status labels
export const userStatusLabel: Record<UserStatus, string> = {
  INVITED: "Invited",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  TERMINATED: "Terminated",
  LOCKED: "Locked",
};

// Status colors
export const userStatusColor: Record<UserStatus, string> = {
  INVITED: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-yellow-100 text-yellow-800",
  TERMINATED: "bg-red-100 text-red-800",
  LOCKED: "bg-orange-100 text-orange-800",
};

// Employment type labels
export const employmentTypeLabel: Record<EmploymentType, string> = {
  EMPLOYEE: "Employee",
  CONTRACTOR: "Contractor",
  AGENT: "Agent",
};

// Risk level labels
export const riskLevelLabel: Record<RiskLevel, string> = {
  NORMAL: "Normal",
  ELEVATED: "Elevated",
  DANGEROUS: "Dangerous",
};

// Risk level icons/colors
export const riskLevelColor: Record<RiskLevel, string> = {
  NORMAL: "text-muted-foreground",
  ELEVATED: "text-yellow-600",
  DANGEROUS: "text-red-600",
};

// Access request status labels
export const accessRequestStatusLabel: Record<AccessRequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  DENIED: "Denied",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

// Access request status colors
export const accessRequestStatusColor: Record<AccessRequestStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  DENIED: "bg-red-100 text-red-800",
  EXPIRED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

// Sensitive roles that require approval
export const SENSITIVE_ROLES: Role[] = [
  "SUPER_ADMIN",
  "CUSTODY_OFFICER",
  "COMPLIANCE_OFFICER",
];

// Default role expiration in days
export const DEFAULT_ROLE_EXPIRATION_DAYS: Partial<Record<Role, number>> = {
  SUPER_ADMIN: 90,
  CUSTODY_OFFICER: 180,
};
