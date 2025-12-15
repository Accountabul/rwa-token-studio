import React, { useState, useMemo } from "react";
import { Lock, Clock, CheckCircle2, XCircle, AlertTriangle, Plus } from "lucide-react";
import { Role } from "@/types/tokenization";
import { EscrowStatus, escrowPermissions } from "@/types/escrow";
import { mockEscrows } from "@/data/mockEscrows";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EscrowTable } from "./EscrowTable";
import { CreateEscrowDialog } from "./CreateEscrowDialog";

interface EscrowDashboardProps {
  role: Role;
  onNavigateToDetails: (escrowId: string) => void;
}

type FilterTab = "ALL" | EscrowStatus;

export const EscrowDashboard: React.FC<EscrowDashboardProps> = ({ role, onNavigateToDetails }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const canCreate = escrowPermissions.createEscrow.includes(role);

  const filteredEscrows = useMemo(() => {
    if (activeTab === "ALL") return mockEscrows;
    return mockEscrows.filter((e) => e.status === activeTab);
  }, [activeTab]);

  const stats = useMemo(() => {
    const active = mockEscrows.filter((e) => e.status === "ACTIVE");
    const totalValueLocked = active.reduce((sum, e) => sum + (e.amountUsd || 0), 0);
    const expiringSoon = active.filter((e) => {
      if (!e.cancelAfter) return false;
      const daysUntilExpiry = (new Date(e.cancelAfter).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    });
    return {
      activeCount: active.length,
      totalValueLocked,
      expiringSoonCount: expiringSoon.length,
      completedCount: mockEscrows.filter((e) => e.status === "COMPLETED").length,
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Escrow Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage XRPL escrows for XRP, IOUs, and MPT tokens
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Escrow
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Lock}
          label="Active Escrows"
          value={stats.activeCount}
          iconColor="text-primary"
        />
        <StatCard
          icon={Clock}
          label="Total Value Locked"
          value={`$${stats.totalValueLocked.toLocaleString()}`}
          iconColor="text-blue-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Expiring Soon (30d)"
          value={stats.expiringSoonCount}
          iconColor="text-amber-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completedCount}
          iconColor="text-green-500"
        />
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList>
          <TabsTrigger value="ALL">
            All ({mockEscrows.length})
          </TabsTrigger>
          <TabsTrigger value="ACTIVE">
            Active ({mockEscrows.filter((e) => e.status === "ACTIVE").length})
          </TabsTrigger>
          <TabsTrigger value="COMPLETED">
            Completed ({mockEscrows.filter((e) => e.status === "COMPLETED").length})
          </TabsTrigger>
          <TabsTrigger value="CANCELLED">
            Cancelled ({mockEscrows.filter((e) => e.status === "CANCELLED").length})
          </TabsTrigger>
          <TabsTrigger value="EXPIRED">
            Expired ({mockEscrows.filter((e) => e.status === "EXPIRED").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Escrow Table */}
      <EscrowTable escrows={filteredEscrows} onRowClick={onNavigateToDetails} />

      {/* Create Escrow Dialog */}
      <CreateEscrowDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, iconColor }) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);
