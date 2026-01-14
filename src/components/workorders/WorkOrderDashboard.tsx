import React, { useState, useMemo } from "react";
import {
  FileText,
  PlayCircle,
  Clock,
  CheckCircle2,
  Wallet,
  DollarSign,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { Role } from "@/types/tokenization";
import { WorkOrderStatus } from "@/types/workOrder";
import { mockWorkOrders, getWorkOrderStats } from "@/data/mockWorkOrders";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { WorkOrderTable } from "./WorkOrderTable";
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog";
import { WORK_ORDER_PERMISSIONS } from "@/permissions/matrix";

interface WorkOrderDashboardProps {
  role: Role;
  onNavigateToDetails: (workOrderId: string) => void;
}

type FilterTab = "ALL" | WorkOrderStatus;

export const WorkOrderDashboard: React.FC<WorkOrderDashboardProps> = ({
  role,
  onNavigateToDetails,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const canCreate = WORK_ORDER_PERMISSIONS.actions.CREATE?.includes(role) ?? false;

  const stats = useMemo(() => getWorkOrderStats(), []);

  const filteredWorkOrders = useMemo(() => {
    let orders = [...mockWorkOrders];

    // Filter by tab
    if (activeTab !== "ALL") {
      orders = orders.filter((wo) => wo.status === activeTab);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      orders = orders.filter(
        (wo) =>
          wo.title.toLowerCase().includes(query) ||
          wo.businessName.toLowerCase().includes(query) ||
          wo.assigneeName?.toLowerCase().includes(query)
      );
    }

    return orders;
  }, [activeTab, searchQuery]);

  const tabCounts = useMemo(() => ({
    ALL: mockWorkOrders.length,
    DRAFT: stats.draft,
    ACTIVE: stats.active,
    IN_PROGRESS: stats.inProgress,
    COMPLETED: stats.completed,
    PAID: stats.paid,
    DISPUTED: mockWorkOrders.filter((wo) => wo.status === "DISPUTED").length,
  }), [stats]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Work Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage work orders tracked as NFTs/MPTs on the XRPL
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Work Order
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard
          icon={FileText}
          label="Total"
          value={stats.total}
          iconColor="text-foreground"
        />
        <StatCard
          icon={FileText}
          label="Draft"
          value={stats.draft}
          iconColor="text-muted-foreground"
        />
        <StatCard
          icon={PlayCircle}
          label="Active"
          value={stats.active}
          iconColor="text-blue-500"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats.inProgress}
          iconColor="text-amber-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          iconColor="text-green-500"
        />
        <StatCard
          icon={Wallet}
          label="Paid"
          value={stats.paid}
          iconColor="text-emerald-500"
        />
        <StatCard
          icon={DollarSign}
          label="Total Value"
          value={`$${(stats.totalValueUsd / 1000).toFixed(0)}k`}
          iconColor="text-primary"
        />
        <StatCard
          icon={Wallet}
          label="Paid Value"
          value={`$${(stats.paidValueUsd / 1000).toFixed(0)}k`}
          iconColor="text-emerald-500"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by title, business, or assignee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as FilterTab)}
      >
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="ALL">All ({tabCounts.ALL})</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft ({tabCounts.DRAFT})</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active ({tabCounts.ACTIVE})</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">
            In Progress ({tabCounts.IN_PROGRESS})
          </TabsTrigger>
          <TabsTrigger value="COMPLETED">
            Completed ({tabCounts.COMPLETED})
          </TabsTrigger>
          <TabsTrigger value="PAID">Paid ({tabCounts.PAID})</TabsTrigger>
          <TabsTrigger value="DISPUTED">
            Disputed ({tabCounts.DISPUTED})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Work Order Table */}
      <WorkOrderTable
        workOrders={filteredWorkOrders}
        onRowClick={onNavigateToDetails}
      />

      {/* Create Work Order Dialog */}
      <CreateWorkOrderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  iconColor,
}) => (
  <div className="bg-card border border-border rounded-lg p-3">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg bg-muted ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);
