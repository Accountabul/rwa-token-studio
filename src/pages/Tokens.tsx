import React, { useState } from "react";
import { Sidebar } from "@/components/tokenization/Sidebar";
import { TokenDashboard } from "@/components/tokens/TokenDashboard";
import { Role } from "@/types/tokenization";

const Tokens: React.FC = () => {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar role={role} onRoleChange={setRole} />
      <main className="flex-1 p-6 overflow-auto">
        <TokenDashboard role={role} />
      </main>
    </div>
  );
};

export default Tokens;
