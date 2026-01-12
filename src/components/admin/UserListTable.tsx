import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, UserRoleAssignment } from "@/types/userManagement";
import { Role, roleLabel } from "@/types/tokenization";
import { UserStatusBadge } from "./UserStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Search, ChevronRight, Shield, Clock } from "lucide-react";

interface UserListTableProps {
  users: UserProfile[];
  isLoading: boolean;
  onUserSelect: (userId: string) => void;
}

export const UserListTable: React.FC<UserListTableProps> = ({
  users,
  isLoading,
  onUserSelect,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");

  // Fetch roles for all users
  const { data: userRoles } = useQuery({
    queryKey: ["user-roles-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .or("expires_at.is.null,expires_at.gt.now()");
      
      if (error) throw error;
      return data as UserRoleAssignment[];
    },
  });

  // Map roles by user ID
  const rolesByUser = React.useMemo(() => {
    const map = new Map<string, UserRoleAssignment[]>();
    userRoles?.forEach((role) => {
      const existing = map.get(role.user_id) || [];
      existing.push(role);
      map.set(role.user_id, existing);
    });
    return map;
  }, [userRoles]);

  // Filter users by search
  const filteredUsers = React.useMemo(() => {
    if (!search) return users;
    const lower = search.toLowerCase();
    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(lower) ||
        user.email.toLowerCase().includes(lower) ||
        user.department?.toLowerCase().includes(lower) ||
        user.job_title?.toLowerCase().includes(lower)
    );
  }, [users, search]);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name, email, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const roles = rolesByUser.get(user.id) || [];
                
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
                          roles.slice(0, 2).map((role) => (
                            <Badge 
                              key={role.id} 
                              variant="outline"
                              className="text-xs"
                            >
                              {role.expires_at && (
                                <Clock className="w-3 h-3 mr-1 text-yellow-500" />
                              )}
                              {roleLabel[role.role]}
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
                      <UserStatusBadge status={(user.status as any) || "ACTIVE"} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {user.last_login_at 
                          ? format(new Date(user.last_login_at), "MMM d, yyyy")
                          : "Never"
                        }
                      </span>
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
    </div>
  );
};
