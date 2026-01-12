import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { Role, roleLabel } from "@/types/tokenization";
import { UserProfile, UserRoleAssignment, UserStatus } from "@/types/userManagement";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Users, 
  UserPlus, 
  Clock, 
  AlertTriangle,
  Search,
  ChevronRight,
  Mail,
  Pause,
  XCircle,
} from "lucide-react";

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = React.useState<Role>("SUPER_ADMIN");
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");

  // Fetch all users
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Fetch all user roles
  const { data: userRoles, isLoading: loadingRoles } = useQuery({
    queryKey: ["admin-user-roles-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .or("expires_at.is.null,expires_at.gt.now()");
      
      if (error) throw error;
      return data as UserRoleAssignment[];
    },
  });

  // Fetch expiring roles (within 14 days)
  const { data: expiringRoles } = useQuery({
    queryKey: ["expiring-roles"],
    queryFn: async () => {
      const fourteenDaysFromNow = new Date();
      fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .not("expires_at", "is", null)
        .lte("expires_at", fourteenDaysFromNow.toISOString())
        .gt("expires_at", new Date().toISOString());
      
      if (error) throw error;
      return data as UserRoleAssignment[];
    },
  });

  // Compute stats
  const stats = React.useMemo(() => {
    if (!users) return { total: 0, active: 0, suspended: 0, terminated: 0 };
    
    return {
      total: users.length,
      active: users.filter((u) => !u.status || u.status === "ACTIVE").length,
      suspended: users.filter((u) => u.status === "SUSPENDED").length,
      terminated: users.filter((u) => u.status === "TERMINATED").length,
    };
  }, [users]);

  // Map roles by user ID
  const rolesByUser = React.useMemo(() => {
    const map = new Map<string, UserRoleAssignment[]>();
    userRoles?.forEach((r) => {
      const existing = map.get(r.user_id) || [];
      existing.push(r);
      map.set(r.user_id, existing);
    });
    return map;
  }, [userRoles]);

  // Filter users by tab and search
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    
    let filtered = users;
    
    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter((u) => !u.status || u.status === "ACTIVE");
    } else if (activeTab === "suspended") {
      filtered = filtered.filter((u) => u.status === "SUSPENDED");
    } else if (activeTab === "terminated") {
      filtered = filtered.filter((u) => u.status === "TERMINATED");
    }
    
    // Filter by search
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.full_name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower) ||
          u.department?.toLowerCase().includes(lower)
      );
    }
    
    return filtered;
  }, [users, activeTab, search]);

  const getInitials = (name: string, email: string) => {
    if (name && name.length > 0) {
      return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const isLoading = loadingUsers || loadingRoles;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role={role} onRoleChange={setRole} />
        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                </div>
                <p className="text-muted-foreground">
                  Manage users, roles, and permissions across the platform
                </p>
              </div>
              <Button onClick={() => navigate("/admin/roles")} variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                View Roles
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{stats.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                    <Pause className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Suspended</p>
                    <p className="text-2xl font-bold">{stats.suspended}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiring Roles</p>
                    <p className="text-2xl font-bold">{expiringRoles?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expiring Roles Warning */}
          {expiringRoles && expiringRoles.length > 0 && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      {expiringRoles.length} role{expiringRoles.length > 1 ? "s" : ""} expiring soon
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      These time-bound role assignments will expire within the next 14 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Click on a user to view details and manage access
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Tabs and Search */}
              <div className="flex items-center justify-between mb-4 gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all" className="gap-2">
                      All
                      <Badge variant="secondary">{stats.total}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="gap-2">
                      Active
                      <Badge variant="secondary">{stats.active}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="suspended" className="gap-2">
                      Suspended
                      <Badge variant="secondary">{stats.suspended}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="terminated" className="gap-2">
                      Terminated
                      <Badge variant="secondary">{stats.terminated}</Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => {
                          const roles = rolesByUser.get(user.id) || [];
                          const userStatus = (user.status as UserStatus) || "ACTIVE";
                          
                          return (
                            <TableRow 
                              key={user.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.avatar_url || undefined} />
                                    <AvatarFallback>
                                      {getInitials(user.full_name, user.email)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{user.full_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {user.department || "-"}
                                  {user.job_title && (
                                    <div className="text-muted-foreground text-xs">
                                      {user.job_title}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {roles.length === 0 ? (
                                    <span className="text-sm text-muted-foreground">No roles</span>
                                  ) : (
                                    roles.slice(0, 2).map((r) => (
                                      <Badge 
                                        key={r.id} 
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {r.expires_at && (
                                          <Clock className="w-3 h-3 mr-1 text-yellow-500" />
                                        )}
                                        {roleLabel[r.role]}
                                      </Badge>
                                    ))
                                  )}
                                  {roles.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{roles.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <UserStatusBadge status={userStatus} />
                              </TableCell>
                              <TableCell>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminUsers;
