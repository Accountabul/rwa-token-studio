import { Role } from "@/types/tokenization";

// All entities in the system
export type EntityType =
  | "PROJECT"
  | "TOKEN"
  | "WALLET"
  | "ESCROW"
  | "INVESTOR"
  | "BUSINESS"
  | "WORK_ORDER"
  | "PAYOUT_REQUEST"
  | "REPORT"
  | "AUDIT_LOG"
  | "LEDGER_ENTRY"
  | "TAX_PROFILE"
  | "CHECK"
  | "PAYMENT_CHANNEL"
  | "AMM_POOL"
  | "CONTRACT"
  | "KNOWLEDGE_BASE"
  | "MULTI_SIGN_TX"
  | "BATCH_TRANSACTION"
  | "USER_ROLE"
  | "NOTIFICATION"
  | "SIGNING_POLICY";

// All actions that can be performed
export type ActionType =
  | "VIEW"
  | "VIEW_LIST"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "APPROVE"
  | "REJECT"
  | "EXECUTE"
  | "SIGN"
  | "FREEZE"
  | "UNFREEZE"
  | "CLAWBACK"
  | "DISTRIBUTE"
  | "CANCEL"
  | "COMPLETE"
  | "ASSIGN"
  | "LOCK"
  | "UNLOCK"
  | "MINT"
  | "BURN"
  | "RETIRE";

// Field access levels for PII
export type FieldAccessLevel = "FULL" | "MASKED" | "HIDDEN";

// PII field definition
export interface PIIFieldRule {
  fieldName: string;
  accessByRole: Partial<Record<Role, FieldAccessLevel>>;
  maskPattern?: string; // e.g., "***-**-{last4}", "{first}***@{domain}"
  defaultAccess: FieldAccessLevel;
}

// ABAC (Attribute-Based Access Control) conditions
export interface ABACConditions {
  requireSameOrg?: boolean;
  requireAssignment?: boolean;
  requireJurisdiction?: string[];
  requireOwnership?: boolean;
}

// Entity permission rule
export interface EntityPermission {
  entity: EntityType;
  action: ActionType;
  allowedRoles: Role[];
  abacConditions?: ABACConditions;
}

// Complete permission matrix for an entity
export interface EntityPermissionMatrix {
  entity: EntityType;
  actions: Partial<Record<ActionType, Role[]>>;
  piiFields?: PIIFieldRule[];
  fieldAccessByRole?: Partial<Record<Role, string[] | "*">>;
}

// Permission check result
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiresReAuth?: boolean;
}

// Masked field result
export interface MaskedFieldResult<T> {
  data: T;
  maskedFields: string[];
}

// Re-export Role for convenience
export type { Role };
