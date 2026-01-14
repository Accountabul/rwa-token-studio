import React, { useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  UserPlus,
  CheckCircle2,
  Wallet,
  Building2,
  User,
  DollarSign,
  FileText,
} from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import { Role } from "@/types/tokenization";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WorkOrderStatusBadge } from "./WorkOrderStatusBadge";
import { WorkOrderTimeline } from "./WorkOrderTimeline";
import { AssignWorkOrderDialog } from "./AssignWorkOrderDialog";
import { CompleteWorkOrderDialog } from "./CompleteWorkOrderDialog";
import { PayWorkOrderDialog } from "./PayWorkOrderDialog";
import { ExplorerLinkBadge } from "@/components/tokens/ExplorerLinkBadge";
import { WORK_ORDER_PERMISSIONS } from "@/permissions/matrix";
import { cn } from "@/lib/utils";

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  role: Role;
  onBack: () => void;
  onRefresh?: () => void;
}

const tokenTypeColors: Record<string, string> = {
  NFT: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  MPT: "bg-primary/10 text-primary border-primary/20",
};

const categoryLabels: Record<string, string> = {
  MAINTENANCE: "Maintenance",
  INSTALLATION: "Installation",
  PROFESSIONAL_SERVICES: "Professional Services",
  AUDIT: "Audit",
};

export const WorkOrderDetails: React.FC<WorkOrderDetailsProps> = ({
  workOrder,
  role,
  onBack,
  onRefresh,
}) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  const canUpdate = WORK_ORDER_PERMISSIONS.actions.UPDATE?.includes(role) ?? false;
  const canApprove = WORK_ORDER_PERMISSIONS.actions.APPROVE?.includes(role) ?? false;

  const canAssign =
    canUpdate && ["DRAFT", "ACTIVE"].includes(workOrder.status);
  const canComplete =
    canUpdate && workOrder.status === "IN_PROGRESS";
  const canPay = canApprove && workOrder.status === "COMPLETED";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {workOrder.title}
              </h1>
              <WorkOrderStatusBadge status={workOrder.status} />
              <Badge
                variant="outline"
                className={cn("text-xs", tokenTypeColors[workOrder.tokenType])}
              >
                {workOrder.tokenType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {format(new Date(workOrder.createdAt), "MMM d, yyyy 'at' h:mm a")}
              {" by "}
              {workOrder.createdByName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canAssign && (
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(true)}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {workOrder.assigneeUserId ? "Reassign" : "Assign"}
            </Button>
          )}
          {canComplete && (
            <Button
              onClick={() => setCompleteDialogOpen(true)}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete
            </Button>
          )}
          {canPay && (
            <Button
              onClick={() => setPayDialogOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Wallet className="w-4 h-4" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <WorkOrderTimeline workOrder={workOrder} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Work Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="ID" value={workOrder.id} />
            <DetailRow
              label="Category"
              value={
                workOrder.category
                  ? categoryLabels[workOrder.category] || workOrder.category
                  : "—"
              }
            />
            {workOrder.description && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Description
                </p>
                <p className="text-sm text-foreground">{workOrder.description}</p>
              </div>
            )}
            <Separator />
            <DetailRow label="Token Type" value={workOrder.tokenType} />
            {workOrder.tokenId && (
              <DetailRow label="Token ID" value={workOrder.tokenId} />
            )}
            {workOrder.xrplTxHash && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Minting Transaction
                </p>
                <ExplorerLinkBadge
                  type="tx"
                  value={workOrder.xrplTxHash}
                  network="testnet"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Business Name" value={workOrder.businessName} />
            <DetailRow label="Business ID" value={workOrder.businessId} />
          </CardContent>
        </Card>

        {/* Assignee Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Assignee Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workOrder.assigneeUserId ? (
              <>
                <DetailRow label="Name" value={workOrder.assigneeName || "—"} />
                <DetailRow label="User ID" value={workOrder.assigneeUserId} />
                {workOrder.assigneeWalletAddress && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Wallet Address
                    </p>
                    <ExplorerLinkBadge
                      type="address"
                      value={workOrder.assigneeWalletAddress}
                      network="testnet"
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground italic">
                No assignee assigned yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow
              label="Agreed Amount"
              value={`$${workOrder.agreedAmountUsd.toLocaleString()}`}
            />
            <DetailRow label="Currency" value={workOrder.currency} />
            {workOrder.feeAmountUsd !== undefined && (
              <DetailRow
                label="Platform Fee"
                value={`$${workOrder.feeAmountUsd.toLocaleString()}`}
              />
            )}
            {workOrder.netAmountUsd !== undefined && (
              <DetailRow
                label="Net Amount"
                value={`$${workOrder.netAmountUsd.toLocaleString()}`}
              />
            )}
            <Separator />
            {workOrder.paidAt && (
              <DetailRow
                label="Paid At"
                value={format(new Date(workOrder.paidAt), "MMM d, yyyy 'at' h:mm a")}
              />
            )}
            {workOrder.paymentXrplTxHash && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Payment Transaction
                </p>
                <ExplorerLinkBadge
                  type="tx"
                  value={workOrder.paymentXrplTxHash}
                  network="testnet"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AssignWorkOrderDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        workOrder={workOrder}
        onSuccess={onRefresh}
      />
      <CompleteWorkOrderDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        workOrder={workOrder}
        onSuccess={onRefresh}
      />
      <PayWorkOrderDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        workOrder={workOrder}
        onSuccess={onRefresh}
      />
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);
