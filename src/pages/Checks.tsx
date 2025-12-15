import { useState } from "react";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChecksDashboard } from "@/components/checks/ChecksDashboard";

export type Role = "super_admin" | "tokenization_manager" | "compliance_officer" | "custody_officer" | "valuation_officer";

export default function Checks() {
  const [role, setRole] = useState<Role>("super_admin");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role={role} onRoleChange={setRole} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border/40 flex items-center px-4 gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Checks</h1>
          </header>
          <main className="flex-1 p-6">
            <ChecksDashboard />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
