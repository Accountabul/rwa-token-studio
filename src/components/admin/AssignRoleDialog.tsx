import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Role, roleLabel, PRIVILEGED_ROLES, BASIC_ROLES, ROLE_CATEGORIES, ROLE_CATEGORY_LABELS, RoleCategory } from "@/types/tokenization";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Shield, AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  roles: Array<{ role: Role }>;
}

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRoles | null;
  onSuccess: () => void;
}

export const AssignRoleDialog: React.FC<AssignRoleDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}) => {
  const { user: currentUser } = useAuth();
  const [selectedRoles, setSelectedRoles] = React.useState<Role[]>([]);
  const [notes, setNotes] = React.useState("");
  const [expandedCategories, setExpandedCategories] = React.useState<RoleCategory[]>(["ADMINISTRATION"]);

  // Check if current user is SUPER_ADMIN or SYSTEM_ADMIN
  const { data: currentUserRoles } = useQuery({
    queryKey: ["current-user-roles", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .or("expires_at.is.null,expires_at.gt.now()");
      if (error) throw error;
      return data.map((r) => r.role as Role);
    },
    enabled: !!currentUser?.id,
  });

  const isSuperAdmin = currentUserRoles?.includes("SUPER_ADMIN") ?? false;
  const isSystemAdmin = currentUserRoles?.includes("SYSTEM_ADMIN") ?? false;
  const isHiringManager = currentUserRoles?.includes("HIRING_MANAGER") ?? false;
  const canAssignPrivileged = isSuperAdmin || isSystemAdmin;

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedRoles([]);
      setNotes("");
    }
  }, [open]);

  // Get roles that user doesn't already have AND that current user can assign
  const availableRoles = React.useMemo(() => {
    const existingRoles = new Set(user?.roles.map((r) => r.role) || []);
    const allRoles = [...new Set([...PRIVILEGED_ROLES, ...BASIC_ROLES])];
    const notAssigned = allRoles.filter((r) => !existingRoles.has(r));
    
    // Filter based on what the current user can assign
    if (isSuperAdmin) {
      return notAssigned;
    }
    if (isSystemAdmin) {
      // SYSTEM_ADMIN can assign all except SUPER_ADMIN
      return notAssigned.filter((r) => r !== "SUPER_ADMIN");
    }
    if (isHiringManager) {
      // HIRING_MANAGER can only assign basic roles
      return notAssigned.filter((r) => BASIC_ROLES.includes(r));
    }
    return [];
  }, [user, isSuperAdmin, isSystemAdmin, isHiringManager]);

  const toggleCategory = (category: RoleCategory) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const hasPrivilegedRole = selectedRoles.some((r) => PRIVILEGED_ROLES.includes(r));

  const assignRoleMutation = useMutation({
    mutationFn: async () => {
      if (!user || selectedRoles.length === 0) return;

      // Insert all selected roles
      const inserts = selectedRoles.map((role) => ({
        user_id: user.id,
        role,
        notes: notes.trim() || null,
        granted_by: currentUser?.id || null,
      }));

      const { error } = await supabase.from("user_roles").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Assigned ${selectedRoles.length} role(s) to ${user?.full_name || user?.email}`);
      onSuccess();
    },
    onError: (error) => {
      console.error("Failed to assign role:", error);
      toast.error("Failed to assign role. Please try again.");
    },
  });

  const toggleRole = (role: Role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Assign Roles
          </DialogTitle>
          <DialogDescription>
            Assign roles to{" "}
            <span className="font-medium text-foreground">
              {user?.full_name || user?.email}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Role Selection by Category */}
          <div className="space-y-3">
            <Label>Select Roles</Label>
            {availableRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                This user already has all available roles.
              </p>
            ) : (
              <div className="space-y-2">
                {(Object.keys(ROLE_CATEGORIES) as RoleCategory[]).map((category) => {
                  const categoryRoles = ROLE_CATEGORIES[category].filter(r => availableRoles.includes(r));
                  if (categoryRoles.length === 0) return null;
                  
                  return (
                    <Collapsible
                      key={category}
                      open={expandedCategories.includes(category)}
                      onOpenChange={() => toggleCategory(category)}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <span className="text-sm font-medium">{ROLE_CATEGORY_LABELS[category]}</span>
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform",
                          expandedCategories.includes(category) && "rotate-180"
                        )} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2 space-y-1">
                        {categoryRoles.map((role) => {
                          const isPrivileged = PRIVILEGED_ROLES.includes(role);
                          return (
                            <div
                              key={role}
                              className={cn(
                                "flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer ml-2",
                                selectedRoles.includes(role)
                                  ? isPrivileged
                                    ? "border-amber-500 bg-amber-500/10"
                                    : "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                              onClick={() => toggleRole(role)}
                            >
                              <Checkbox
                                checked={selectedRoles.includes(role)}
                                onCheckedChange={() => toggleRole(role)}
                              />
                              <div className="flex-1 flex items-center gap-2">
                                <p className="font-medium text-sm">
                                  {roleLabel[role]}
                                </p>
                                {isPrivileged && (
                                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}

            {hasPrivilegedRole && (
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  You are assigning a privileged role. This grants elevated access
                  to sensitive operations and data.
                </p>
              </div>
            )}

            {!canAssignPrivileged && (
              <p className="text-xs text-muted-foreground mt-2">
                Note: As a Hiring Manager, you can only assign basic roles.
                Contact a System Admin or Super Admin to assign privileged roles.
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Reason for assigning this role..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => assignRoleMutation.mutate()}
            disabled={selectedRoles.length === 0 || assignRoleMutation.isPending}
          >
            {assignRoleMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Assign {selectedRoles.length > 0 && `(${selectedRoles.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
