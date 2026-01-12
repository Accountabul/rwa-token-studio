import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { Role, roleLabel } from "@/types/tokenization";
import { UserProfile, UserRoleAssignment, UserStatus } from "@/types/userManagement";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { EffectivePermissions } from "@/components/admin/EffectivePermissions";
import { SensitiveRoleWarning } from "@/components/admin/SensitiveRoleWarning";
import { AssignRoleDialog } from "@/components/admin/AssignRoleDialog";
import { RevokeRoleDialog } from "@/components/admin/RevokeRoleDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Key,
  History,
  Mail, 
  Building, 
  Briefcase,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Pause,
  Play,
  XCircle,
} from "lucide-react";

const AdminUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [role, setRole] = React.useState<Role>("SUPER_ADMIN");
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<{ id: string; role: Role } | null>(null);

  // Fetch user profile
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!userId,
  });

  // Fetch user roles
  const { data: userRoles, isLoading: loadingRoles } = useQuery({
    queryKey: ["admin-user-roles", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .or("expires_at.is.null,expires_at.gt.now()");
      
      if (error) throw error;
      return data as UserRoleAssignment[];
    },
    enabled: !!userId,
  });

  // Suspend user mutation
  const suspendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "SUSPENDED", suspension_reason: "Suspended by administrator" })
        .eq("id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User suspended");
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", userId] });
    },
    onError: () => {
      toast.error("Failed to suspend user");
    },
  });

  // Activate user mutation
  const activateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "ACTIVE", suspension_reason: null })
        .eq("id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User activated");
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", userId] });
    },
    onError: () => {
      toast.error("Failed to activate user");
    },
  });

  // Terminate user mutation
  const terminateMutation = useMutation({
    mutationFn: async () => {
      // First, revoke all roles
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      if (rolesError) throw rolesError;

      // Then update status
      const { error } = await supabase
        .from("profiles")
        .update({ status: "TERMINATED", suspension_reason: "Terminated by administrator" })
        .eq("id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User terminated and all roles revoked");
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles", userId] });
    },
    onError: () => {
      toast.error("Failed to terminate user");
    },
  });

  const getInitials = (name: string, email: string) => {
    if (name && name.length > 0) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleRevokeRole = (roleAssignment: UserRoleAssignment) => {
    setSelectedRole({ id: roleAssignment.id, role: roleAssignment.role });
    setRevokeDialogOpen(true);
  };

  if (loadingUser) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar role={role} onRoleChange={setRole} />
          <main className="flex-1 p-8 overflow-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!user) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar role={role} onRoleChange={setRole} />
          <main className="flex-1 p-8 overflow-auto">
            <div className="text-center py-12">
              <p className="text-muted-foreground">User not found</p>
              <Button 
                variant="link" 
                onClick={() => navigate("/admin/users")}
                className="mt-2"
              >
                Back to Users
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const activeRoles = userRoles?.map(r => r.role) || [];
  const userStatus = (user.status as UserStatus) || "ACTIVE";
  const isTerminated = userStatus === "TERMINATED";
  const isSuspended = userStatus === "SUSPENDED";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role={role} onRoleChange={setRole} />
        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin/users")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.full_name, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{user.full_name}</h1>
                    <UserStatusBadge status={userStatus} />
                  </div>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isTerminated && (
                  <>
                    {isSuspended ? (
                      <Button 
                        variant="outline"
                        onClick={() => activateMutation.mutate()}
                        disabled={activateMutation.isPending}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Activate
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">
                            <Pause className="w-4 h-4 mr-2" />
                            Suspend
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Suspend User?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will temporarily disable the user's access. 
                              They will not be able to log in until reactivated.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => suspendMutation.mutate()}
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              Suspend User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <XCircle className="w-4 h-4 mr-2" />
                          Terminate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Terminate User?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently disable the user's access and revoke all their roles.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => terminateMutation.mutate()}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Terminate User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="roles" className="gap-2">
                <Shield className="w-4 h-4" />
                Roles
                <Badge variant="secondary" className="ml-1">
                  {activeRoles.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="permissions" className="gap-2">
                <Key className="w-4 h-4" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                Access History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Employee details and organizational information
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-medium">{user.department || "Not assigned"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Job Title</p>
                        <p className="font-medium">{user.job_title || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">
                          {format(new Date(user.created_at), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Login</p>
                        <p className="font-medium">
                          {user.last_login_at 
                            ? format(new Date(user.last_login_at), "MMMM d, yyyy 'at' h:mm a")
                            : "Never"
                          }
                        </p>
                      </div>
                    </div>
                    {user.suspension_reason && (
                      <div className="flex items-center gap-3">
                        <Pause className="w-4 h-4 text-yellow-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Suspension Reason</p>
                          <p className="font-medium text-yellow-600">{user.suspension_reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Assigned Roles</CardTitle>
                    <CardDescription>
                      Roles determine what permissions this user has
                    </CardDescription>
                  </div>
                  {!isTerminated && (
                    <Button onClick={() => setAssignDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Assign Role
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {loadingRoles ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : userRoles && userRoles.length > 0 ? (
                    <div className="space-y-3">
                      {userRoles.map((roleAssignment) => (
                        <div
                          key={roleAssignment.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-4">
                            <Shield className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">
                                {roleLabel[roleAssignment.role]}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Granted {format(new Date(roleAssignment.granted_at), "MMM d, yyyy")}
                                {roleAssignment.expires_at && (
                                  <span className="text-yellow-600 ml-2">
                                    · Expires {format(new Date(roleAssignment.expires_at), "MMM d, yyyy")}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          {!isTerminated && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRevokeRole(roleAssignment)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      No roles assigned
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions">
              <Card>
                <CardHeader>
                  <CardTitle>Effective Permissions</CardTitle>
                  <CardDescription>
                    All permissions granted through assigned roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeRoles.length > 0 ? (
                    <EffectivePermissions roles={activeRoles} />
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      No permissions - assign a role to grant permissions
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Access History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Access History</CardTitle>
                  <CardDescription>
                    Timeline of role and permission changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Access history coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
          <AssignRoleDialog
            open={assignDialogOpen}
            onOpenChange={setAssignDialogOpen}
            user={{ id: userId!, email: user.email, full_name: user.full_name, roles: userRoles || [] }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["admin-user-roles", userId] });
              setAssignDialogOpen(false);
            }}
          />

          <RevokeRoleDialog
            open={revokeDialogOpen}
            onOpenChange={setRevokeDialogOpen}
            user={{ id: userId!, email: user.email, full_name: user.full_name }}
            roleToRevoke={selectedRole}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["admin-user-roles", userId] });
              setRevokeDialogOpen(false);
            }}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminUserDetail;
