import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { Role } from "@/types/tokenization";
import { UserRolesTable } from "@/components/admin/UserRolesTable";
import { Shield, Users } from "lucide-react";

const AdminUsers: React.FC = () => {
  const [role, setRole] = React.useState<Role>("SUPER_ADMIN");

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
              <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            </div>
            <p className="text-muted-foreground">
              Manage user roles and permissions across the platform
            </p>
          </div>

          {/* User Roles Table */}
          <UserRolesTable />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminUsers;
