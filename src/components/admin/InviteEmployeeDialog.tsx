import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Role, roleLabel, PRIVILEGED_ROLES, BASIC_ROLES } from "@/types/tokenization";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, UserPlus, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface InviteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  justification: string;
}

export const InviteEmployeeDialog: React.FC<InviteEmployeeDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = React.useState<Role[]>([]);

  // Check if current user is SUPER_ADMIN
  const { data: userRoles } = useQuery({
    queryKey: ["current-user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .or("expires_at.is.null,expires_at.gt.now()");
      if (error) throw error;
      return data.map((r) => r.role as Role);
    },
    enabled: !!user?.id,
  });

  const isSuperAdmin = userRoles?.includes("SUPER_ADMIN") ?? false;

  // Roles available to assign based on current user's permissions
  const availableRoles = isSuperAdmin
    ? [...BASIC_ROLES, ...PRIVILEGED_ROLES]
    : BASIC_ROLES;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      employmentType: "EMPLOYEE",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset();
      setSelectedRoles([]);
    }
  }, [open, reset]);

  const inviteMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase.from("invitations").insert({
        email: data.email.toLowerCase().trim(),
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        phone: data.phone.trim() || null,
        department: data.department.trim() || null,
        job_title: data.jobTitle.trim() || null,
        employment_type: data.employmentType,
        start_date: data.startDate || null,
        initial_roles: selectedRoles,
        justification: data.justification.trim() || null,
        invited_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to send invitation:", error);
      toast.error("Failed to send invitation. Please try again.");
    },
  });

  const toggleRole = (role: Role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const hasPrivilegedRole = selectedRoles.some((r) => PRIVILEGED_ROLES.includes(r));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite New Employee
          </DialogTitle>
          <DialogDescription>
            Send an invitation to a new employee to join the platform
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => inviteMutation.mutate(data))}>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName", { required: "Required" })}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName", { required: "Required" })}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    })}
                    placeholder="john.doe@company.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Employment Details */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Employment Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    {...register("department")}
                    placeholder="Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    {...register("jobTitle")}
                    placeholder="Senior Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select
                    defaultValue="EMPLOYEE"
                    onValueChange={(val) => {
                      const event = { target: { name: "employmentType", value: val } };
                      register("employmentType").onChange(event as any);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                      <SelectItem value="AGENT">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" {...register("startDate")} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Initial Roles */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Initial Roles
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Select the roles to assign when the employee accepts the invitation
              </p>

              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map((role) => {
                  const isPrivileged = PRIVILEGED_ROLES.includes(role);
                  return (
                    <div
                      key={role}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
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
                        <span className="font-medium text-sm">{roleLabel[role]}</span>
                        {isPrivileged && (
                          <Shield className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasPrivilegedRole && (
                <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    You are assigning a privileged role. This grants elevated access
                    to sensitive operations and data.
                  </p>
                </div>
              )}

              {!isSuperAdmin && (
                <p className="text-xs text-muted-foreground mt-2">
                  Note: As a Hiring Manager, you can only assign basic roles.
                  Contact a Super Admin to assign privileged roles.
                </p>
              )}
            </div>

            <Separator />

            {/* Justification */}
            <div className="space-y-2">
              <Label htmlFor="justification">Business Justification</Label>
              <Textarea
                id="justification"
                {...register("justification")}
                placeholder="Explain why this employee needs access..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
