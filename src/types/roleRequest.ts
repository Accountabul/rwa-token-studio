// ============================================================================
// ROLE REQUEST TYPES
// ============================================================================

import { Role, RoleCategory } from "./tokenization";

// Role request status
export type RoleRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

// Role request from database
export interface RoleRequest {
  id: string;
  requested_by: string;
  role_name: string;
  category: RoleCategory;
  purpose: string;
  backend_access: string[];
  restrictions: string[];
  justification: string;
  status: RoleRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_role: Role | null;
  created_at: string;
  // Joined data
  requester?: {
    id: string;
    full_name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    full_name: string;
    email: string;
  };
}

// Role catalog entry from database
export interface RoleCatalogEntry {
  id: string;
  role_code: Role;
  display_name: string;
  category: RoleCategory;
  purpose: string;
  backend_access: string[];
  restrictions: string[];
  is_privileged: boolean;
  requires_approval: boolean;
  default_expiration_days: number | null;
  created_at: string;
}

// Status labels
export const roleRequestStatusLabel: Record<RoleRequestStatus, string> = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Status colors
export const roleRequestStatusColor: Record<RoleRequestStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};
