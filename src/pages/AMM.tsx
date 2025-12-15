import { useState } from "react";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AMMDashboard } from "@/components/amm/AMMDashboard";

export type Role = "super_admin" | "tokenization_manager" | "compliance_officer" | "custody_officer" | "valuation_officer";

export default function AMM() {
  const [role, setRole] = useState<Role>("super_admin");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role={role} onRoleChange={setRole} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border/40 flex items-center px-4 gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">AMM Liquidity Pools</h1>
          </header>
          <main className="flex-1 p-6">
            <AMMDashboard />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
