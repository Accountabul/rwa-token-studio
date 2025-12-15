import React, { useState } from "react";
import { Role } from "@/types/tokenization";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { WalletDashboard } from "@/components/wallet/WalletDashboard";

const Wallets: React.FC = () => {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar role={role} onRoleChange={setRole} />
      <main className="flex-1 overflow-auto">
        <WalletDashboard role={role} />
      </main>
    </div>
  );
};

export default Wallets;
