import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { EscrowDashboard } from "@/components/escrow/EscrowDashboard";

const Escrows: React.FC = () => {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar role={role} onRoleChange={setRole} />
      <main className="flex-1 overflow-auto">
        <EscrowDashboard role={role} onNavigateToDetails={(id) => navigate(`/escrows/${id}`)} />
      </main>
    </div>
  );
};

export default Escrows;
