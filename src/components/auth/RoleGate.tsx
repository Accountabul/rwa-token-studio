import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EntityType, ActionType, hasPermission } from "@/permissions";

interface RoleGateProps {
  /** Entity to check permission for */
  entity: EntityType;
  /** Action to check permission for */
  action: ActionType;
  /** Content to render if user has permission */
  children: React.ReactNode;
  /** Optional fallback content if user lacks permission */
  fallback?: React.ReactNode;
  /** If true, requires ALL user roles to have permission (default: any role) */
  requireAll?: boolean;
}

/**
 * RoleGate - Conditionally render content based on user permissions
 * 
 * @example
 * // Hide a button from unauthorized users
 * <RoleGate entity="TOKEN" action="CREATE">
 *   <Button>Create Token</Button>
 * </RoleGate>
 * 
 * @example
 * // Show alternative content for unauthorized users
 * <RoleGate entity="REPORT" action="EXPORT" fallback={<span>Export disabled</span>}>
 *   <Button>Export Report</Button>
 * </RoleGate>
 */
export const RoleGate: React.FC<RoleGateProps> = ({
  entity,
  action,
  children,
  fallback = null,
  requireAll = false,
}) => {
  const { roles } = useAuth();

  // No roles = no access
  if (roles.length === 0) {
    return <>{fallback}</>;
  }

  // Check if user has permission through any of their roles
  const hasAccess = requireAll
    ? roles.every((role) => hasPermission(role, entity, action))
    : roles.some((role) => hasPermission(role, entity, action));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * useHasPermission - Hook to check if user has a specific permission
 * 
 * @example
 * const canCreateToken = useHasPermission("TOKEN", "CREATE");
 * if (canCreateToken) { ... }
 */
export function useHasPermission(entity: EntityType, action: ActionType): boolean {
  const { roles } = useAuth();
  return roles.some((role) => hasPermission(role, entity, action));
}

/**
 * useHasAnyPermission - Hook to check if user has any of multiple permissions
 * 
 * @example
 * const canManageTokens = useHasAnyPermission([
 *   { entity: "TOKEN", action: "CREATE" },
 *   { entity: "TOKEN", action: "UPDATE" },
 * ]);
 */
export function useHasAnyPermission(
  permissions: Array<{ entity: EntityType; action: ActionType }>
): boolean {
  const { roles } = useAuth();
  return permissions.some(({ entity, action }) =>
    roles.some((role) => hasPermission(role, entity, action))
  );
}
