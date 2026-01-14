import React from "react";
import { Badge } from "@/components/ui/badge";
import { WorkOrderStatus } from "@/types/workOrder";
import { cn } from "@/lib/utils";

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatus;
  className?: string;
}

const statusConfig: Record<WorkOrderStatus, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  PAID: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  DISPUTED: {
    label: "Disputed",
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
};

export const WorkOrderStatusBadge: React.FC<WorkOrderStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
};
