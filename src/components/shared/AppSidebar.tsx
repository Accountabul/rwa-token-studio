import React, { useState, useMemo, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Role, roleLabel } from "@/types/tokenization";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/permissions";
import { NAV_DEPARTMENTS, NavDepartment, NavItem } from "@/config/navigationDepartments";
import { cn } from "@/lib/utils";
import {
  Hexagon,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  Shield,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AppSidebarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

const allRoles: Role[] = [
  "SUPER_ADMIN",
  "TOKENIZATION_MANAGER",
  "COMPLIANCE_OFFICER",
  "CUSTODY_OFFICER",
  "VALUATION_OFFICER",
  "FINANCE_OFFICER",
  "AUDITOR",
];

export const AppSidebar: React.FC<AppSidebarProps> = ({ role, onRoleChange }) => {
  const location = useLocation();
  const { profile, roles, signOut } = useAuth();

  // Check if user can access admin section
  const canAccessAdmin = roles.some(r => 
    ["SUPER_ADMIN", "SYSTEM_ADMIN", "HIRING_MANAGER"].includes(r)
  );

  // Helper to check if a path is active
  const isActive = useCallback((href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  // Find which department contains the active route
  const activeDepartmentId = useMemo(() => {
    for (const dept of NAV_DEPARTMENTS) {
      if (dept.items.some(item => isActive(item.href))) {
        return dept.id;
      }
    }
    return null;
  }, [isActive]);

  // Track expanded departments - auto-expand active department
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(() => {
    return new Set(activeDepartmentId ? [activeDepartmentId] : []);
  });

  // Toggle department expansion
  const toggleDept = useCallback((deptId: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  }, []);

  // Filter departments and items based on user's roles
  const visibleDepartments = useMemo(() => {
    if (roles.length === 0) return [];

    return NAV_DEPARTMENTS
      .map(dept => ({
        ...dept,
        items: dept.items.filter(item =>
          roles.some(userRole => hasPermission(userRole, item.entity, item.action))
        )
      }))
      .filter(dept => dept.items.length > 0);
  }, [roles]);

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = profile?.full_name || profile?.email || "User";
  const displayEmail = profile?.email || "";

  return (
    <aside className="w-64 sidebar-gradient flex flex-col border-r border-sidebar-border shrink-0">
      {/* Logo & Notification Bell */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl accent-gradient flex items-center justify-center shadow-glow">
              <Hexagon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-sidebar-foreground tracking-tight">
                Accountabul Codex
              </h1>
              <p className="text-[10px] text-sidebar-muted font-medium uppercase tracking-wider mt-0.5">
                RWA Tokenization Engine
              </p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Navigation - Department-based */}
      <nav className="px-3 py-4 flex-1 overflow-y-auto">
        {visibleDepartments.length > 0 ? (
          <div className="space-y-1">
            {visibleDepartments.map((dept) => (
              <DepartmentGroup
                key={dept.id}
                department={dept}
                isExpanded={expandedDepts.has(dept.id)}
                onToggle={() => toggleDept(dept.id)}
                isActive={isActive}
                hasActiveChild={dept.items.some(item => isActive(item.href))}
              />
            ))}
          </div>
        ) : (
          <div className="px-3 py-4 text-sm text-sidebar-muted text-center">
            <p>No accessible pages.</p>
            <p className="text-xs mt-1">Contact an admin to be assigned a role.</p>
          </div>
        )}

        {/* Notifications Link */}
        <div className="mt-6 pt-4 border-t border-sidebar-border/50">
          <Link
            to="/notifications"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
              isActive("/notifications")
                ? "text-sidebar-accent bg-sidebar-accent/10 font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
            )}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </Link>
        </div>

        {/* Admin Section - Visible to SUPER_ADMIN, SYSTEM_ADMIN, HIRING_MANAGER */}
        {canAccessAdmin && (
          <div className="mt-4 pt-4 border-t border-sidebar-border/50">
            <Collapsible
              open={expandedDepts.has("admin")}
              onOpenChange={() => toggleDept("admin")}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                    "text-amber-500/90 hover:bg-amber-500/10",
                    isActive("/admin") && "bg-amber-500/10"
                  )}
                >
                  <Shield className="w-4 h-4" />
                  <span className="flex-1 text-left">Administration</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      expandedDepts.has("admin") && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-1 ml-4 pl-2 border-l border-sidebar-border/30 space-y-0.5">
                  <Link
                    to="/admin/users"
                    className={cn(
                      "block px-3 py-2 rounded-lg text-sm transition-all duration-200",
                      isActive("/admin/users")
                        ? "text-amber-500 bg-amber-500/10 font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
                    )}
                  >
                    User Management
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </nav>

      {/* User Info & Roles */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-foreground/10 flex items-center justify-center">
            <User className="w-4 h-4 text-sidebar-foreground/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-sidebar-muted truncate">
              {displayEmail}
            </p>
          </div>
        </div>

        {/* Assigned Roles */}
        {roles.length > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-sidebar-muted font-medium">
              <Shield className="w-3 h-3" />
              <span>Your Roles</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {roles.map((r) => (
                <span
                  key={r}
                  className={cn(
                    "inline-flex px-2 py-0.5 text-[10px] font-medium rounded",
                    r === "SUPER_ADMIN"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-sidebar-accent/10 text-sidebar-accent"
                  )}
                >
                  {roleLabel[r]}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-sidebar-muted font-medium">
              <Shield className="w-3 h-3" />
              <span>Roles</span>
            </div>
            <p className="text-xs text-sidebar-muted italic">
              No roles assigned yet
            </p>
          </div>
        )}

        {/* Dev Mode Role Override - ONLY in development */}
        {import.meta.env.DEV && (
          <div className="space-y-1.5 pt-2 border-t border-sidebar-border/50">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-amber-500/70 font-medium">
              <span>🔧 Dev Override</span>
            </div>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => onRoleChange(e.target.value as Role)}
                className="w-full appearance-none rounded-lg bg-sidebar-foreground/5 border border-sidebar-border px-3 py-2 text-xs text-sidebar-foreground font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-200 cursor-pointer pr-8"
              >
                {allRoles.map((r) => (
                  <option key={r} value={r} className="bg-sidebar text-sidebar-foreground">
                    {roleLabel[r]}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-muted pointer-events-none" />
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Department Group Component
// ─────────────────────────────────────────────────────────────────────────────

interface DepartmentGroupProps {
  department: NavDepartment;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: (href: string) => boolean;
  hasActiveChild: boolean;
}

const DepartmentGroup: React.FC<DepartmentGroupProps> = ({
  department,
  isExpanded,
  onToggle,
  isActive,
  hasActiveChild,
}) => {
  const Icon = department.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            hasActiveChild
              ? "text-sidebar-accent bg-sidebar-accent/5"
              : "text-sidebar-foreground/80 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left truncate">{department.label}</span>
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 text-sidebar-muted transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-1 ml-4 pl-2 border-l border-sidebar-border/30 space-y-0.5">
          {department.items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm transition-all duration-200",
                isActive(item.href)
                  ? "text-sidebar-accent bg-sidebar-accent/10 font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
