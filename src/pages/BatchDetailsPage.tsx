import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { AppSidebar } from "@/components/shared/AppSidebar";
import BatchDetails from "@/components/batch/BatchDetails";
import { mockBatches } from "@/data/mockBatches";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BatchDetailsPage = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("SUPER_ADMIN");

  const batch = mockBatches.find((b) => b.id === batchId);

  if (!batch) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar role={role} onRoleChange={setRole} />
        <main className="flex-1 p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Batch not found</h2>
            <Button variant="outline" onClick={() => navigate("/batch")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
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
        <BatchDetails batch={batch} role={role} />
      </main>
    </div>
  );
};

export default BatchDetailsPage;
