import { useState } from "react";
import { Role } from "@/types/tokenization";
import { AppSidebar } from "@/components/shared/AppSidebar";
import BatchBuilder from "@/components/batch/BatchBuilder";

const BatchBuilderPage = () => {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar role={role} onRoleChange={setRole} />
      <main className="flex-1 p-6 overflow-auto">
        <BatchBuilder role={role} />
      </main>
    </div>
  );
};

export default BatchBuilderPage;
