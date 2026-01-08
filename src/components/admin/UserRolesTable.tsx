import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Role, roleLabel } from "@/types/tokenization";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, Trash2, Loader2, User } from "lucide-react";
import { AssignRoleDialog } from "./AssignRoleDialog";
import { RevokeRoleDialog } from "./RevokeRoleDialog";
import { cn } from "@/lib/utils";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  roles: Array<{
    id: string;
    role: Role;
    granted_at: string;
    expires_at: string | null;
    notes: string | null;
  }>;
}

export const UserRolesTable: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserWithRoles | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<{
    id: string;
    role: Role;
  } | null>(null);

  // Fetch all profiles with their roles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Merge roles into profiles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        roles: (userRoles || [])
          .filter((ur) => ur.user_id === profile.id)
          .map((ur) => ({
            id: ur.id,
            role: ur.role as Role,
            granted_at: ur.granted_at,
            expires_at: ur.expires_at,
            notes: ur.notes,
          })),
      }));

      return usersWithRoles;
    },
  });

  // Filter users by search
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    const lower = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(lower) ||
        u.full_name.toLowerCase().includes(lower)
    );
  }, [users, search]);

  const handleAssignRole = (user: UserWithRoles) => {
    setSelectedUser(user);
    setAssignDialogOpen(true);
  };

  const handleRevokeRole = (user: UserWithRoles, roleId: string, role: Role) => {
    setSelectedUser(user);
    setSelectedRole({ id: roleId, role });
    setRevokeDialogOpen(true);
  };

  const getInitials = (name: string, email: string) => {
    if (name && name !== email) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary" className="text-xs">
          {users?.length || 0} users
        </Badge>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead>User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {search ? "No users match your search" : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(user.full_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <span className="text-sm text-muted-foreground italic">
                          No roles assigned
                        </span>
                      ) : (
                        user.roles.map((r) => (
                          <Badge
                            key={r.id}
                            variant="outline"
                            className={cn(
                              "text-xs cursor-pointer hover:bg-destructive/10 hover:border-destructive transition-colors group",
                              r.role === "SUPER_ADMIN" &&
                                "bg-amber-500/10 border-amber-500/30 text-amber-600"
                            )}
                            onClick={() => handleRevokeRole(user, r.id, r.role)}
                          >
                            {roleLabel[r.role]}
                            <Trash2 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignRole(user)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Assign Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <AssignRoleDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        user={selectedUser}
        onSuccess={() => {
          refetch();
          setAssignDialogOpen(false);
        }}
      />

      <RevokeRoleDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        user={selectedUser}
        roleToRevoke={selectedRole}
        onSuccess={() => {
          refetch();
          setRevokeDialogOpen(false);
        }}
      />
    </div>
  );
};
