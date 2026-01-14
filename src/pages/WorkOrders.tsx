import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { WorkOrderDashboard } from "@/components/workorders/WorkOrderDashboard";
import { useAuth } from "@/contexts/AuthContext";

const WorkOrders: React.FC = () => {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const [role, setRole] = useState<Role>(roles[0] || "OPERATIONS_ADMIN");

  const handleNavigateToDetails = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar role={role} onRoleChange={setRole} />
        <SidebarInset className="flex-1">
          <Breadcrumbs />
          <WorkOrderDashboard
            role={role}
            onNavigateToDetails={handleNavigateToDetails}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default WorkOrders;
