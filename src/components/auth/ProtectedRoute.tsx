import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { EntityType, ActionType, hasPermission } from "@/permissions";
import { getRoutePermission } from "@/config/routePermissions";
import { auditService } from "@/domain/services/AuditService";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional: Override entity permission check */
  requiredEntity?: EntityType;
  /** Optional: Override action permission check */
  requiredAction?: ActionType;
}

/**
 * ProtectedRoute - Guards routes based on authentication and permissions
 * 
 * 1. Redirects unauthenticated users to /auth
 * 2. Checks role-based permissions for the route
 * 3. Redirects unauthorized users to /access-denied
 * 4. Logs ACCESS_DENIED events for audit trail
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredEntity,
  requiredAction,
}) => {
  const { user, profile, roles, isLoading } = useAuth();
  const location = useLocation();
  const accessDeniedLogged = useRef(false);

  // Determine required permission (explicit props or from route config)
  const routePermission = getRoutePermission(location.pathname);
  const entity = requiredEntity || routePermission?.entity;
  const action = requiredAction || routePermission?.action;

  const hasAccess = React.useMemo(() => {
    if (!entity || !action) return true; // No permission required

    // Allow authenticated users with no roles to land on the home page,
    // where we can show the "No roles assigned" state instead of trapping them.
    if (roles.length === 0) return location.pathname === "/";

    return roles.some((role) => hasPermission(role, entity, action));
  }, [roles, entity, action, location.pathname]);

  // Log access denied events (only once per route)
  useEffect(() => {
    if (
      !isLoading &&
      user &&
      !hasAccess &&
      entity &&
      action &&
      !accessDeniedLogged.current
    ) {
      accessDeniedLogged.current = true;
      auditService.logAccessDenied(
        user.id,
        profile?.email || user.email || "Unknown",
        roles,
        location.pathname,
        entity,
        action
      );
    }
  }, [isLoading, user, hasAccess, entity, action, location.pathname, profile, roles]);

  // Reset logged flag when route changes
  useEffect(() => {
    accessDeniedLogged.current = false;
  }, [location.pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Authenticated but no permission - redirect to access denied
  if (!hasAccess && entity && action) {
    return (
      <Navigate
        to="/access-denied"
        replace
        state={{
          requestedRoute: location.pathname,
          requiredEntity: entity,
          requiredAction: action,
        }}
      />
    );
  }

  return <>{children}</>;
};
