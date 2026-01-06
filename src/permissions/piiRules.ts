import { Role } from "@/types/tokenization";
import { EntityType, FieldAccessLevel, PIIFieldRule } from "./types";
import { PERMISSION_MATRIX } from "./matrix";

// ============================================================================
// PII FIELD DEFINITIONS BY ENTITY
// ============================================================================

// Consolidated PII rules from all entity permission matrices
export const getAllPIIRules = (): Map<EntityType, PIIFieldRule[]> => {
  const rules = new Map<EntityType, PIIFieldRule[]>();
  
  for (const [entity, matrix] of Object.entries(PERMISSION_MATRIX)) {
    if (matrix.piiFields && matrix.piiFields.length > 0) {
      rules.set(entity as EntityType, matrix.piiFields);
    }
  }
  
  return rules;
};

// Get PII rules for a specific entity
export const getPIIRulesForEntity = (entity: EntityType): PIIFieldRule[] => {
  const matrix = PERMISSION_MATRIX[entity];
  return matrix?.piiFields || [];
};

// ============================================================================
// MASKING PATTERNS
// ============================================================================

export interface MaskPatternConfig {
  pattern: string;
  description: string;
  example: { input: string; output: string };
}

export const MASK_PATTERNS: Record<string, MaskPatternConfig> = {
  EMAIL: {
    pattern: "{first}***@{domain}",
    description: "Shows first character and domain",
    example: { input: "john.doe@example.com", output: "j***@example.com" },
  },
  PHONE: {
    pattern: "***-***-{last4}",
    description: "Shows last 4 digits only",
    example: { input: "555-123-4567", output: "***-***-4567" },
  },
  SSN: {
    pattern: "***-**-{last4}",
    description: "Shows last 4 digits only",
    example: { input: "123-45-6789", output: "***-**-6789" },
  },
  EIN: {
    pattern: "**-***{last4}",
    description: "Shows last 4 digits only",
    example: { input: "12-3456789", output: "**-***6789" },
  },
  DATE_YEAR_ONLY: {
    pattern: "{year}-XX-XX",
    description: "Shows year only",
    example: { input: "1990-05-15", output: "1990-XX-XX" },
  },
  NAME_INITIAL: {
    pattern: "{first} {lastInitial}.",
    description: "Shows first name and last initial",
    example: { input: "John Doe", output: "John D." },
  },
  ADDRESS_PARTIAL: {
    pattern: "{city}, {state}",
    description: "Shows city and state only",
    example: { input: "123 Main St, New York, NY 10001", output: "New York, NY" },
  },
};

// ============================================================================
// FIELD ACCESS DETERMINATION
// ============================================================================

/**
 * Determines the access level for a specific field based on role
 */
export const getFieldAccessLevel = (
  entity: EntityType,
  fieldName: string,
  role: Role
): FieldAccessLevel => {
  const piiRules = getPIIRulesForEntity(entity);
  const fieldRule = piiRules.find(rule => rule.fieldName === fieldName);
  
  if (!fieldRule) {
    // Field is not a PII field, full access
    return "FULL";
  }
  
  // Check role-specific access
  const roleAccess = fieldRule.accessByRole[role];
  if (roleAccess) {
    return roleAccess;
  }
  
  // Fall back to default access
  return fieldRule.defaultAccess;
};

/**
 * Checks if a field should be masked for a given role
 */
export const shouldMaskField = (
  entity: EntityType,
  fieldName: string,
  role: Role
): boolean => {
  const accessLevel = getFieldAccessLevel(entity, fieldName, role);
  return accessLevel === "MASKED";
};

/**
 * Checks if a field should be hidden for a given role
 */
export const shouldHideField = (
  entity: EntityType,
  fieldName: string,
  role: Role
): boolean => {
  const accessLevel = getFieldAccessLevel(entity, fieldName, role);
  return accessLevel === "HIDDEN";
};

/**
 * Gets all fields that should be hidden for a given role and entity
 */
export const getHiddenFields = (entity: EntityType, role: Role): string[] => {
  const piiRules = getPIIRulesForEntity(entity);
  return piiRules
    .filter(rule => getFieldAccessLevel(entity, rule.fieldName, role) === "HIDDEN")
    .map(rule => rule.fieldName);
};

/**
 * Gets all fields that should be masked for a given role and entity
 */
export const getMaskedFields = (entity: EntityType, role: Role): string[] => {
  const piiRules = getPIIRulesForEntity(entity);
  return piiRules
    .filter(rule => getFieldAccessLevel(entity, rule.fieldName, role) === "MASKED")
    .map(rule => rule.fieldName);
};

/**
 * Gets the mask pattern for a specific field
 */
export const getMaskPattern = (entity: EntityType, fieldName: string): string | undefined => {
  const piiRules = getPIIRulesForEntity(entity);
  const fieldRule = piiRules.find(rule => rule.fieldName === fieldName);
  return fieldRule?.maskPattern;
};
