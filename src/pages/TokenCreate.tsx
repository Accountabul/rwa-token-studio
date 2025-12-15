import React, { useState } from "react";
import { Sidebar } from "@/components/tokenization/Sidebar";
import { TokenWizard } from "@/components/tokens/wizard/TokenWizard";
import { Role } from "@/types/tokenization";

const TokenCreate: React.FC = () => {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar role={role} onRoleChange={setRole} />
      <main className="flex-1 p-6 overflow-auto">
        <TokenWizard role={role} />
      </main>
    </div>
  );
};

export default TokenCreate;
