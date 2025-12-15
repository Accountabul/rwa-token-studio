import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { AppSidebar } from "@/components/shared/AppSidebar";
import ContractDetails from "@/components/contracts/ContractDetails";
import { mockContracts } from "@/data/mockContracts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ContractDetailsPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("SUPER_ADMIN");

  const contract = mockContracts.find((c) => c.id === contractId);

  if (!contract) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar role={role} onRoleChange={setRole} />
        <main className="flex-1 p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Contract not found</h2>
            <Button variant="outline" onClick={() => navigate("/contracts")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contracts
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar role={role} onRoleChange={setRole} />
      <main className="flex-1 p-6 overflow-auto">
        <ContractDetails contract={contract} role={role} />
      </main>
    </div>
  );
};

export default ContractDetailsPage;
