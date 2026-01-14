import React from "react";
import { format } from "date-fns";
import {
  FileText,
  PlayCircle,
  Clock,
  CheckCircle2,
  Wallet,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { WorkOrder, WorkOrderStatus } from "@/types/workOrder";
import { cn } from "@/lib/utils";

interface WorkOrderTimelineProps {
  workOrder: WorkOrder;
}

interface TimelineStep {
  status: WorkOrderStatus;
  label: string;
  icon: React.ElementType;
  timestamp?: string;
  variant: "default" | "success" | "warning" | "error";
}

export const WorkOrderTimeline: React.FC<WorkOrderTimelineProps> = ({
  workOrder,
}) => {
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        status: "DRAFT",
        label: "Created",
        icon: FileText,
        timestamp: workOrder.createdAt,
        variant: "default",
      },
    ];

    // Check if assigned (has assignee)
    if (workOrder.assigneeUserId) {
      steps.push({
        status: "ACTIVE",
        label: "Assigned",
        icon: PlayCircle,
        timestamp: workOrder.status !== "DRAFT" ? workOrder.updatedAt : undefined,
        variant: "default",
      });
    }

    // In Progress
    if (
      ["IN_PROGRESS", "COMPLETED", "PAID"].includes(workOrder.status) ||
      (workOrder.status === "DISPUTED" && workOrder.completedAt)
    ) {
      steps.push({
        status: "IN_PROGRESS",
        label: "In Progress",
        icon: Clock,
        variant: "default",
      });
    }

    // Completed
    if (["COMPLETED", "PAID"].includes(workOrder.status)) {
      steps.push({
        status: "COMPLETED",
        label: "Completed",
        icon: CheckCircle2,
        timestamp: workOrder.completedAt,
        variant: "success",
      });
    }

    // Paid
    if (workOrder.status === "PAID") {
      steps.push({
        status: "PAID",
        label: "Paid",
        icon: Wallet,
        timestamp: workOrder.paidAt,
        variant: "success",
      });
    }

    // Cancelled
    if (workOrder.status === "CANCELLED") {
      steps.push({
        status: "CANCELLED",
        label: "Cancelled",
        icon: XCircle,
        timestamp: workOrder.updatedAt,
        variant: "error",
      });
    }

    // Disputed
    if (workOrder.status === "DISPUTED") {
      steps.push({
        status: "DISPUTED",
        label: "Disputed",
        icon: AlertTriangle,
        timestamp: workOrder.updatedAt,
        variant: "warning",
      });
    }

    return steps;
  };

  const steps = getTimelineSteps();
  const currentStepIndex = steps.length - 1;

  // Calculate progress
  const maxSteps = 5; // DRAFT -> ACTIVE -> IN_PROGRESS -> COMPLETED -> PAID
  const progressPercent = Math.min(100, (steps.length / maxSteps) * 100);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="font-semibold text-foreground mb-4">Work Order Timeline</h3>

      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-all duration-500",
            workOrder.status === "PAID"
              ? "bg-emerald-500"
              : workOrder.status === "COMPLETED"
              ? "bg-green-500"
              : workOrder.status === "CANCELLED"
              ? "bg-red-500"
              : workOrder.status === "DISPUTED"
              ? "bg-orange-500"
              : "bg-primary"
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Timeline Points */}
      <div className="flex justify-between items-start">
        {steps.map((step, index) => (
          <TimelinePoint
            key={step.status}
            icon={step.icon}
            label={step.label}
            timestamp={step.timestamp}
            isCompleted={index <= currentStepIndex}
            variant={step.variant}
          />
        ))}
      </div>
    </div>
  );
};

interface TimelinePointProps {
  icon: React.ElementType;
  label: string;
  timestamp?: string;
  isCompleted: boolean;
  variant: "default" | "success" | "warning" | "error";
}

const TimelinePoint: React.FC<TimelinePointProps> = ({
  icon: Icon,
  label,
  timestamp,
  isCompleted,
  variant,
}) => {
  const iconColors = {
    default: isCompleted ? "text-primary" : "text-muted-foreground",
    success: "text-green-600",
    warning: "text-orange-500",
    error: "text-red-600",
  };

  const bgColors = {
    default: isCompleted ? "bg-primary/10" : "bg-muted",
    success: "bg-green-500/10",
    warning: "bg-orange-500/10",
    error: "bg-red-500/10",
  };

  return (
    <div className="flex flex-col items-center text-center min-w-[80px]">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center mb-2",
          bgColors[variant]
        )}
      >
        <Icon className={cn("w-5 h-5", iconColors[variant])} />
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {timestamp && (
        <p className="text-xs text-muted-foreground">
          {format(new Date(timestamp), "MMM d, yyyy")}
        </p>
      )}
    </div>
  );
};
