import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Role, roleLabel } from "@/types/tokenization";
import { Permission, PermissionCategory } from "@/types/userManagement";
import { RiskLevelBadge } from "./RiskLevelBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface EffectivePermissionsProps {
  roles: Role[];
  showCategoryHeaders?: boolean;
  compact?: boolean;
}

export const EffectivePermissions: React.FC<EffectivePermissionsProps> = ({
  roles,
  showCategoryHeaders = true,
  compact = false,
}) => {
  // Fetch all permissions
  const { data: allPermissions, isLoading: loadingPermissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("category", { ascending: true })
        .order("code", { ascending: true });
      
      if (error) throw error;
      return data as Permission[];
    },
  });

  // Fetch role permissions for all provided roles
  const { data: rolePermissions, isLoading: loadingRolePerms } = useQuery({
    queryKey: ["role-permissions", roles],
    queryFn: async () => {
      if (roles.length === 0) return [];
      
      const { data, error } = await supabase
        .from("role_permissions")
        .select("permission_id, role")
        .in("role", roles);
      
      if (error) throw error;
      return data;
    },
    enabled: roles.length > 0,
  });

  if (loadingPermissions || loadingRolePerms) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-8 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Get set of permission IDs the user has
  const userPermissionIds = new Set(
    rolePermissions?.map((rp) => rp.permission_id) || []
  );

  // Group permissions by category
  const categorizedPermissions: PermissionCategory[] = [];
  const categoryMap = new Map<string, Permission[]>();
  
  allPermissions?.forEach((perm) => {
    const existing = categoryMap.get(perm.category) || [];
    existing.push(perm);
    categoryMap.set(perm.category, existing);
  });
  
  categoryMap.forEach((permissions, name) => {
    categorizedPermissions.push({ name, permissions });
  });

  // Count stats
  const totalPermissions = allPermissions?.length || 0;
  const grantedPermissions = userPermissionIds.size;
  const dangerousGranted = allPermissions?.filter(
    (p) => p.risk_level === "DANGEROUS" && userPermissionIds.has(p.id)
  ).length || 0;
  const elevatedGranted = allPermissions?.filter(
    (p) => p.risk_level === "ELEVATED" && userPermissionIds.has(p.id)
  ).length || 0;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="text-sm">
            <strong>{grantedPermissions}</strong> of {totalPermissions} permissions
          </span>
        </div>
        {dangerousGranted > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-sm">
              <strong>{dangerousGranted}</strong> dangerous
            </span>
          </div>
        )}
        {elevatedGranted > 0 && (
          <div className="flex items-center gap-2 text-yellow-600">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-sm">
              <strong>{elevatedGranted}</strong> elevated
            </span>
          </div>
        )}
      </div>

      {/* Roles list */}
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <span
            key={role}
            className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary"
          >
            {roleLabel[role]}
          </span>
        ))}
      </div>

      {/* Permission Categories */}
      <div className={cn("space-y-4", compact && "space-y-2")}>
        {categorizedPermissions.map((category) => (
          <Card key={category.name} className={cn(compact && "border-0 shadow-none")}>
            {showCategoryHeaders && (
              <CardHeader className={cn("pb-2", compact && "px-0 pt-0")}>
                <CardTitle className="text-sm font-semibold">
                  {category.name}
                </CardTitle>
              </CardHeader>
            )}
            <CardContent className={cn("pt-0", compact && "p-0")}>
              <div className={cn(
                "grid gap-2",
                compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
              )}>
                {category.permissions.map((permission) => {
                  const hasPermission = userPermissionIds.has(permission.id);
                  
                  return (
                    <div
                      key={permission.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md border",
                        hasPermission 
                          ? "bg-background border-border" 
                          : "bg-muted/30 border-transparent opacity-50"
                      )}
                    >
                      <Checkbox
                        checked={hasPermission}
                        disabled
                        className="data-[state=checked]:bg-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-medium truncate",
                            !hasPermission && "text-muted-foreground"
                          )}>
                            {permission.name}
                          </span>
                          {permission.risk_level !== "NORMAL" && (
                            <RiskLevelBadge 
                              level={permission.risk_level} 
                              showLabel={false}
                              size="sm"
                            />
                          )}
                          {permission.description && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{permission.description}</p>
                                {permission.requires_approval && (
                                  <p className="text-yellow-500 mt-1 text-xs">
                                    ⚠️ Requires approval workflow
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {permission.code}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
