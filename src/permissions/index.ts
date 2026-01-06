// ============================================================================
// UNIFIED PERMISSION SYSTEM
// ============================================================================
// This module provides a single source of truth for all role-based access
// control (RBAC), field-level permissions, and PII masking rules.
// ============================================================================

// Core types
export type {
  EntityType,
  ActionType,
  FieldAccessLevel,
  PIIFieldRule,
  ABACConditions,
  EntityPermission,
  EntityPermissionMatrix,
  PermissionCheckResult,
  MaskedFieldResult,
  Role,
} from "./types";

// Permission matrix
export {
  PERMISSION_MATRIX,
  // Individual entity permissions
  PROJECT_PERMISSIONS,
  TOKEN_PERMISSIONS,
  WALLET_PERMISSIONS,
  ESCROW_PERMISSIONS,
  INVESTOR_PERMISSIONS,
  BUSINESS_PERMISSIONS,
  WORK_ORDER_PERMISSIONS,
  PAYOUT_REQUEST_PERMISSIONS,
  REPORT_PERMISSIONS,
  AUDIT_LOG_PERMISSIONS,
  LEDGER_ENTRY_PERMISSIONS,
  TAX_PROFILE_PERMISSIONS,
  CHECK_PERMISSIONS,
  PAYMENT_CHANNEL_PERMISSIONS,
  AMM_POOL_PERMISSIONS,
  CONTRACT_PERMISSIONS,
  KNOWLEDGE_BASE_PERMISSIONS,
  MULTI_SIGN_TX_PERMISSIONS,
  BATCH_TRANSACTION_PERMISSIONS,
  // Legacy compatibility exports
  tokenPermissions,
  escrowPermissions,
  multiSignPermissions,
} from "./matrix";

// PII rules
export {
  getAllPIIRules,
  getPIIRulesForEntity,
  MASK_PATTERNS,
  getFieldAccessLevel,
  shouldMaskField,
  shouldHideField,
  getHiddenFields,
  getMaskedFields,
  getMaskPattern,
} from "./piiRules";

// Helper functions
export {
  // Permission checking
  hasPermission,
  checkPermission,
  getAllowedActions,
  getAccessibleEntities,
  canAccessEntity,
  // Field access & masking
  getFieldAccess,
  maskField,
  filterResponseByRole,
  filterArrayByRole,
  // Role utilities
  isAdminRole,
  isComplianceRole,
  isCustodyRole,
  isFinanceRole,
  isReadOnlyRole,
  roleLabel,
} from "./helpers";
