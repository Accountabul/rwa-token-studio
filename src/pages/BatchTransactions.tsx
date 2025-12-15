import { useState } from "react";
import { Role } from "@/types/tokenization";
import { AppSidebar } from "@/components/shared/AppSidebar";
import BatchDashboard from "@/components/batch/BatchDashboard";

const BatchTransactions = () => {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar role={role} onRoleChange={setRole} />
      <main className="flex-1 p-6 overflow-auto">
        <BatchDashboard role={role} />
      </main>
    </div>
  );
};

export default BatchTransactions;
