import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { EscrowDetails } from "@/components/escrow/EscrowDetails";
import { mockEscrows } from "@/data/mockEscrows";

const EscrowDetailsPage: React.FC = () => {
  const { escrowId } = useParams<{ escrowId: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("SUPER_ADMIN");

  const escrow = mockEscrows.find((e) => e.id === escrowId);

  if (!escrow) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role={role} onRoleChange={setRole} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Escrow Not Found</h2>
            <p className="text-muted-foreground mb-4">The escrow you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate("/escrows")}
              className="text-primary hover:underline"
            >
              Back to Escrows
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar role={role} onRoleChange={setRole} />
      <main className="flex-1 overflow-auto">
        <EscrowDetails escrow={escrow} role={role} onBack={() => navigate("/escrows")} />
      </main>
    </div>
  );
};

export default EscrowDetailsPage;
