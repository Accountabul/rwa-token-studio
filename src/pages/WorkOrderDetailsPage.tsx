import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { WorkOrderDetails } from "@/components/workorders/WorkOrderDetails";
import { mockWorkOrders } from "@/data/mockWorkOrders";
import { useAuth } from "@/contexts/AuthContext";

const WorkOrderDetailsPage: React.FC = () => {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const { roles } = useAuth();
  const [role, setRole] = useState<Role>(roles[0] || "OPERATIONS_ADMIN");

  // Force re-render on refresh
  const [, setRefreshKey] = useState(0);

  const workOrder = mockWorkOrders.find((wo) => wo.id === workOrderId);

  const handleBack = () => {
    navigate("/work-orders");
  };

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  if (!workOrder) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar role={role} onRoleChange={setRole} />
          <SidebarInset className="flex-1">
            <Breadcrumbs />
            <div className="p-6">
              <h1 className="text-2xl font-bold text-foreground">
                Work Order Not Found
              </h1>
              <p className="text-muted-foreground mt-2">
                The requested work order could not be found.
              </p>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar role={role} onRoleChange={setRole} />
        <SidebarInset className="flex-1">
          <Breadcrumbs />
          <WorkOrderDetails
            workOrder={workOrder}
            role={role}
            onBack={handleBack}
            onRefresh={handleRefresh}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default WorkOrderDetailsPage;
