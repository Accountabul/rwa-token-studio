import React from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Role, roleLabel } from "@/types/tokenization";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
}

interface RevokeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRoles | null;
  roleToRevoke: { id: string; role: Role } | null;
  onSuccess: () => void;
}

export const RevokeRoleDialog: React.FC<RevokeRoleDialogProps> = ({
  open,
  onOpenChange,
  user,
  roleToRevoke,
  onSuccess,
}) => {
  const revokeRoleMutation = useMutation({
    mutationFn: async () => {
      if (!roleToRevoke) return;

      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleToRevoke.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(
        `Revoked ${roleLabel[roleToRevoke?.role || "AUDITOR"]} from ${user?.full_name || user?.email}`
      );
      onSuccess();
    },
    onError: (error) => {
      console.error("Failed to revoke role:", error);
      toast.error("Failed to revoke role. Please try again.");
    },
  });

  const isSuperAdmin = roleToRevoke?.role === "SUPER_ADMIN";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Revoke Role
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to revoke the{" "}
                <Badge
                  variant="outline"
                  className={isSuperAdmin ? "bg-amber-500/10 text-amber-600" : ""}
                >
                  {roleToRevoke && roleLabel[roleToRevoke.role]}
                </Badge>{" "}
                role from{" "}
                <span className="font-medium text-foreground">
                  {user?.full_name || user?.email}
                </span>
                ?
              </p>

              {isSuperAdmin && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <strong>Warning:</strong> Revoking Super Admin access will remove
                  all administrative privileges from this user. They will lose
                  access to user management and other admin features.
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                This action can be reversed by assigning the role again.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => revokeRoleMutation.mutate()}
            disabled={revokeRoleMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {revokeRoleMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Revoke Role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
