import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { Role, roleLabel } from "@/types/tokenization";
import { Permission, RoleWithPermissions } from "@/types/userManagement";
import { RiskLevelBadge } from "@/components/admin/RiskLevelBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield, ShieldAlert, Info } from "lucide-react";

const AdminRoles: React.FC = () => {
  const [role, setRole] = React.useState<Role>("SUPER_ADMIN");

  // Fetch all permissions
  const { data: permissions, isLoading: loadingPermissions } = useQuery({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("category")
        .order("code");
      
      if (error) throw error;
      return data as Permission[];
    },
  });

  // Fetch role permissions
  const { data: rolePermissions, isLoading: loadingRolePerms } = useQuery({
    queryKey: ["all-role-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Build role data
  const rolesWithPermissions: RoleWithPermissions[] = React.useMemo(() => {
    if (!permissions || !rolePermissions) return [];

    const allRoles: Role[] = [
      "SUPER_ADMIN",
      "TOKENIZATION_MANAGER",
      "COMPLIANCE_OFFICER",
      "CUSTODY_OFFICER",
      "VALUATION_OFFICER",
      "FINANCE_OFFICER",
      "AUDITOR",
    ];

    return allRoles.map((r) => {
      const rolePermIds = new Set(
        rolePermissions.filter((rp) => rp.role === r).map((rp) => rp.permission_id)
      );
      const perms = permissions.filter((p) => rolePermIds.has(p.id));
      
      return {
        role: r,
        label: roleLabel[r],
        permissions: perms,
        dangerousCount: perms.filter((p) => p.risk_level === "DANGEROUS").length,
        elevatedCount: perms.filter((p) => p.risk_level === "ELEVATED").length,
      };
    });
  }, [permissions, rolePermissions]);

  // Group permissions by category for the matrix view
  const permissionCategories = React.useMemo(() => {
    if (!permissions) return [];
    
    const categoryMap = new Map<string, Permission[]>();
    permissions.forEach((p) => {
      const existing = categoryMap.get(p.category) || [];
      existing.push(p);
      categoryMap.set(p.category, existing);
    });
    
    return Array.from(categoryMap.entries()).map(([name, perms]) => ({
      name,
      permissions: perms,
    }));
  }, [permissions]);

  const isLoading = loadingPermissions || loadingRolePerms;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role={role} onRoleChange={setRole} />
        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
            </div>
            <p className="text-muted-foreground">
              View role definitions and their associated permissions
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Role Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rolesWithPermissions.map((roleData) => (
                  <Card key={roleData.role} className="relative">
                    {roleData.dangerousCount > 0 && (
                      <div className="absolute top-3 right-3">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{roleData.label}</CardTitle>
                      <CardDescription>
                        {roleData.permissions.length} permissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {roleData.permissions.length} total
                        </Badge>
                        {roleData.dangerousCount > 0 && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {roleData.dangerousCount} dangerous
                          </Badge>
                        )}
                        {roleData.elevatedCount > 0 && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {roleData.elevatedCount} elevated
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Permission Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle>Permission Matrix</CardTitle>
                  <CardDescription>
                    Complete breakdown of permissions by role and category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {permissionCategories.map((category) => (
                      <AccordionItem key={category.name} value={category.name}>
                        <AccordionTrigger className="text-sm font-semibold">
                          {category.name}
                          <Badge variant="secondary" className="ml-2">
                            {category.permissions.length}
                          </Badge>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 pr-4 font-medium">Permission</th>
                                  <th className="text-left py-2 pr-4 font-medium">Risk</th>
                                  {rolesWithPermissions.map((r) => (
                                    <th 
                                      key={r.role} 
                                      className="text-center py-2 px-2 font-medium text-xs"
                                    >
                                      {r.label.split(" ")[0]}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {category.permissions.map((perm) => (
                                  <tr key={perm.id} className="border-b last:border-0">
                                    <td className="py-2 pr-4">
                                      <div className="flex items-center gap-2">
                                        <span>{perm.name}</span>
                                        {perm.description && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="max-w-xs">{perm.description}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {perm.code}
                                      </span>
                                    </td>
                                    <td className="py-2 pr-4">
                                      <RiskLevelBadge 
                                        level={perm.risk_level} 
                                        showLabel={false}
                                        size="sm"
                                      />
                                    </td>
                                    {rolesWithPermissions.map((r) => {
                                      const hasIt = r.permissions.some((p) => p.id === perm.id);
                                      return (
                                        <td key={r.role} className="py-2 px-2 text-center">
                                          <Checkbox
                                            checked={hasIt}
                                            disabled
                                            className="data-[state=checked]:bg-primary"
                                          />
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminRoles;
