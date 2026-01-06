import { Role } from "@/types/tokenization";
import { EntityType, ActionType, FieldAccessLevel, PermissionCheckResult, MaskedFieldResult } from "./types";
import { PERMISSION_MATRIX } from "./matrix";
import { 
  getFieldAccessLevel, 
  getMaskPattern, 
  getHiddenFields,
  getMaskedFields 
} from "./piiRules";

// ============================================================================
// PERMISSION CHECKING
// ============================================================================

/**
 * Check if a role has permission to perform an action on an entity
 */
export const hasPermission = (
  role: Role,
  entity: EntityType,
  action: ActionType
): boolean => {
  const matrix = PERMISSION_MATRIX[entity];
  if (!matrix) {
    console.warn(`No permission matrix found for entity: ${entity}`);
    return false;
  }
  
  const allowedRoles = matrix.actions[action];
  if (!allowedRoles) {
    // Action not defined for this entity
    return false;
  }
  
  return allowedRoles.includes(role);
};

/**
 * Check permission with detailed result
 */
export const checkPermission = (
  role: Role,
  entity: EntityType,
  action: ActionType
): PermissionCheckResult => {
  const matrix = PERMISSION_MATRIX[entity];
  
  if (!matrix) {
    return {
      allowed: false,
      reason: `Unknown entity: ${entity}`,
    };
  }
  
  const allowedRoles = matrix.actions[action];
  
  if (!allowedRoles) {
    return {
      allowed: false,
      reason: `Action ${action} is not defined for ${entity}`,
    };
  }
  
  if (allowedRoles.length === 0) {
    return {
      allowed: false,
      reason: `Action ${action} is not allowed for any role on ${entity}`,
    };
  }
  
  if (!allowedRoles.includes(role)) {
    return {
      allowed: false,
      reason: `Role ${role} is not authorized to ${action} on ${entity}`,
    };
  }
  
  return { allowed: true };
};

/**
 * Get all actions a role can perform on an entity
 */
export const getAllowedActions = (role: Role, entity: EntityType): ActionType[] => {
  const matrix = PERMISSION_MATRIX[entity];
  if (!matrix) return [];
  
  const allowed: ActionType[] = [];
  for (const [action, roles] of Object.entries(matrix.actions)) {
    if (roles && roles.includes(role)) {
      allowed.push(action as ActionType);
    }
  }
  
  return allowed;
};

/**
 * Get all entities a role can access (VIEW or VIEW_LIST)
 */
export const getAccessibleEntities = (role: Role): EntityType[] => {
  const accessible: EntityType[] = [];
  
  for (const [entity, matrix] of Object.entries(PERMISSION_MATRIX)) {
    const canView = matrix.actions.VIEW?.includes(role);
    const canViewList = matrix.actions.VIEW_LIST?.includes(role);
    
    if (canView || canViewList) {
      accessible.push(entity as EntityType);
    }
  }
  
  return accessible;
};

/**
 * Check if a role can perform any action on an entity
 */
export const canAccessEntity = (role: Role, entity: EntityType): boolean => {
  return getAllowedActions(role, entity).length > 0;
};

// ============================================================================
// FIELD ACCESS & MASKING
// ============================================================================

/**
 * Get field access level for a role
 */
export const getFieldAccess = (
  role: Role,
  entity: EntityType,
  fieldName: string
): FieldAccessLevel => {
  return getFieldAccessLevel(entity, fieldName, role);
};

/**
 * Apply a mask pattern to a value
 */
export const maskField = (value: string, pattern: string): string => {
  if (!value) return value;
  
  // Email pattern: {first}***@{domain}
  if (pattern.includes("{first}") && pattern.includes("{domain}")) {
    const emailMatch = value.match(/^(.)(.*?)@(.+)$/);
    if (emailMatch) {
      return `${emailMatch[1]}***@${emailMatch[3]}`;
    }
  }
  
  // Phone pattern: ***-***-{last4}
  if (pattern.includes("{last4}") && pattern.includes("***-***")) {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 4) {
      return `***-***-${digits.slice(-4)}`;
    }
  }
  
  // SSN pattern: ***-**-{last4}
  if (pattern === "***-**-{last4}") {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 4) {
      return `***-**-${digits.slice(-4)}`;
    }
  }
  
  // Date pattern: {year}-XX-XX
  if (pattern === "{year}-XX-XX") {
    const dateMatch = value.match(/^(\d{4})/);
    if (dateMatch) {
      return `${dateMatch[1]}-XX-XX`;
    }
  }
  
  // Name pattern: {first} {lastInitial}.
  if (pattern.includes("{first}") && pattern.includes("{lastInitial}")) {
    const parts = value.trim().split(/\s+/);
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastInitial = parts[parts.length - 1][0];
      return `${firstName} ${lastInitial}.`;
    }
    return value[0] + ".";
  }
  
  // EIN pattern: **-***{last4}
  if (pattern === "**-***{last4}") {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 4) {
      return `**-***${digits.slice(-4)}`;
    }
  }
  
  // Default: just return asterisks
  return "***";
};

/**
 * Filter response data based on role permissions
 * Removes hidden fields and masks appropriate fields
 */
export const filterResponseByRole = <T extends Record<string, unknown>>(
  data: T,
  entity: EntityType,
  role: Role
): MaskedFieldResult<Partial<T>> => {
  const result: Partial<T> = { ...data };
  const maskedFields: string[] = [];
  
  // Get hidden fields and remove them
  const hiddenFields = getHiddenFields(entity, role);
  for (const field of hiddenFields) {
    if (field in result) {
      delete result[field];
    }
  }
  
  // Get masked fields and apply masks
  const maskedFieldsList = getMaskedFields(entity, role);
  for (const field of maskedFieldsList) {
    if (field in result && result[field] != null) {
      const pattern = getMaskPattern(entity, field);
      if (pattern) {
        const originalValue = result[field];
        if (typeof originalValue === "string") {
          (result as Record<string, unknown>)[field] = maskField(originalValue, pattern);
          maskedFields.push(field);
        }
      }
    }
  }
  
  return { data: result, maskedFields };
};

/**
 * Filter an array of records by role
 */
export const filterArrayByRole = <T extends Record<string, unknown>>(
  data: T[],
  entity: EntityType,
  role: Role
): MaskedFieldResult<Partial<T>[]> => {
  const allMaskedFields = new Set<string>();
  
  const filteredData = data.map(item => {
    const result = filterResponseByRole(item, entity, role);
    result.maskedFields.forEach(field => allMaskedFields.add(field));
    return result.data;
  });
  
  return {
    data: filteredData,
    maskedFields: Array.from(allMaskedFields),
  };
};

// ============================================================================
// ROLE UTILITIES
// ============================================================================

/**
 * Check if role is an admin-level role
 */
export const isAdminRole = (role: Role): boolean => {
  return role === "SUPER_ADMIN";
};

/**
 * Check if role has compliance responsibilities
 */
export const isComplianceRole = (role: Role): boolean => {
  return role === "SUPER_ADMIN" || role === "COMPLIANCE_OFFICER";
};

/**
 * Check if role has custody responsibilities
 */
export const isCustodyRole = (role: Role): boolean => {
  return role === "SUPER_ADMIN" || role === "CUSTODY_OFFICER";
};

/**
 * Check if role has finance responsibilities
 */
export const isFinanceRole = (role: Role): boolean => {
  return role === "SUPER_ADMIN" || role === "FINANCE_OFFICER";
};

/**
 * Check if role is read-only
 */
export const isReadOnlyRole = (role: Role): boolean => {
  return role === "AUDITOR";
};

/**
 * Get the display label for a role (re-export from tokenization)
 */
export { roleLabel } from "@/types/tokenization";
