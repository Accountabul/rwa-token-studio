import React from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Role, roleLabel } from "@/types/tokenization";
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
import { Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

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

const ALL_ROLES: Role[] = [
  "SUPER_ADMIN",
  "TOKENIZATION_MANAGER",
  "COMPLIANCE_OFFICER",
  "CUSTODY_OFFICER",
  "VALUATION_OFFICER",
  "FINANCE_OFFICER",
  "AUDITOR",
];

export const AssignRoleDialog: React.FC<AssignRoleDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}) => {
  const { user: currentUser } = useAuth();
  const [selectedRoles, setSelectedRoles] = React.useState<Role[]>([]);
  const [notes, setNotes] = React.useState("");

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedRoles([]);
      setNotes("");
    }
  }, [open]);

  // Get roles that user doesn't already have
  const availableRoles = React.useMemo(() => {
    if (!user) return ALL_ROLES;
    const existingRoles = new Set(user.roles.map((r) => r.role));
    return ALL_ROLES.filter((r) => !existingRoles.has(r));
  }, [user]);

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
      <DialogContent className="sm:max-w-md">
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
          {/* Role Selection */}
          <div className="space-y-3">
            <Label>Select Roles</Label>
            {availableRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                This user already has all available roles.
              </p>
            ) : (
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <div
                    key={role}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      selectedRoles.includes(role)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => toggleRole(role)}
                  >
                    <Checkbox
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <div className="flex-1">
                      <p
                        className={cn(
                          "font-medium text-sm",
                          role === "SUPER_ADMIN" && "text-amber-600"
                        )}
                      >
                        {roleLabel[role]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
