import React from "react";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { Clock, Lock, Unlock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Escrow } from "@/types/escrow";
import { cn } from "@/lib/utils";

interface EscrowTimelineProps {
  escrow: Escrow;
}

export const EscrowTimeline: React.FC<EscrowTimelineProps> = ({ escrow }) => {
  const now = new Date();
  const createdDate = new Date(escrow.createdAt);
  const finishDate = escrow.finishAfter ? new Date(escrow.finishAfter) : null;
  const cancelDate = escrow.cancelAfter ? new Date(escrow.cancelAfter) : null;

  // Calculate progress percentage
  let progressPercent = 0;
  if (escrow.status === "COMPLETED" || escrow.status === "CANCELLED") {
    progressPercent = 100;
  } else if (finishDate && cancelDate) {
    const totalDuration = cancelDate.getTime() - createdDate.getTime();
    const elapsed = now.getTime() - createdDate.getTime();
    progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  } else if (finishDate) {
    const totalDuration = finishDate.getTime() - createdDate.getTime();
    const elapsed = now.getTime() - createdDate.getTime();
    progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  // Determine current phase
  const isLocked = finishDate && isFuture(finishDate);
  const canUnlock = finishDate && isPast(finishDate) && escrow.status === "ACTIVE";
  const isExpired = cancelDate && isPast(cancelDate) && escrow.status === "ACTIVE";

  // Days remaining
  const daysUntilUnlock = finishDate ? differenceInDays(finishDate, now) : null;
  const daysUntilExpiry = cancelDate ? differenceInDays(cancelDate, now) : null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Escrow Timeline</h3>
        {escrow.status === "ACTIVE" && (
          <div className="flex items-center gap-2">
            {isLocked && daysUntilUnlock !== null && daysUntilUnlock > 0 && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Locked for {daysUntilUnlock} more day{daysUntilUnlock !== 1 ? "s" : ""}
              </span>
            )}
            {canUnlock && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Unlock className="w-4 h-4" />
                Ready to unlock
              </span>
            )}
            {isExpired && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Expired
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-all duration-500",
            escrow.status === "COMPLETED" ? "bg-green-500" :
            escrow.status === "CANCELLED" ? "bg-red-500" :
            escrow.status === "EXPIRED" ? "bg-gray-500" :
            canUnlock ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${progressPercent}%` }}
        />
        {finishDate && escrow.status === "ACTIVE" && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background"
            style={{
              left: `${Math.min(95, ((finishDate.getTime() - createdDate.getTime()) / ((cancelDate?.getTime() || finishDate.getTime() + 86400000 * 30) - createdDate.getTime())) * 100)}%`,
            }}
          />
        )}
      </div>

      {/* Timeline Points */}
      <div className="flex justify-between items-start">
        <TimelinePoint
          icon={Clock}
          label="Created"
          date={format(createdDate, "MMM d, yyyy")}
          status="completed"
        />
        
        {finishDate && (
          <TimelinePoint
            icon={Unlock}
            label="Unlock Date"
            date={format(finishDate, "MMM d, yyyy")}
            status={isPast(finishDate) ? "completed" : "pending"}
          />
        )}
        
        {escrow.status === "COMPLETED" && escrow.completedAt && (
          <TimelinePoint
            icon={CheckCircle2}
            label="Completed"
            date={format(new Date(escrow.completedAt), "MMM d, yyyy")}
            status="completed"
            variant="success"
          />
        )}
        
        {escrow.status === "CANCELLED" && escrow.cancelledAt && (
          <TimelinePoint
            icon={XCircle}
            label="Cancelled"
            date={format(new Date(escrow.cancelledAt), "MMM d, yyyy")}
            status="completed"
            variant="error"
          />
        )}
        
        {cancelDate && escrow.status === "ACTIVE" && (
          <TimelinePoint
            icon={AlertTriangle}
            label="Expires"
            date={format(cancelDate, "MMM d, yyyy")}
            status={isPast(cancelDate) ? "expired" : "pending"}
            variant={isPast(cancelDate) ? "error" : "warning"}
          />
        )}
      </div>
    </div>
  );
};

interface TimelinePointProps {
  icon: React.ElementType;
  label: string;
  date: string;
  status: "completed" | "pending" | "expired";
  variant?: "default" | "success" | "error" | "warning";
}

const TimelinePoint: React.FC<TimelinePointProps> = ({
  icon: Icon,
  label,
  date,
  status,
  variant = "default",
}) => {
  const iconColors = {
    default: status === "completed" ? "text-primary" : "text-muted-foreground",
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-amber-500",
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center mb-2",
        status === "completed" ? "bg-primary/10" : "bg-muted",
        variant === "success" && "bg-green-500/10",
        variant === "error" && "bg-red-500/10",
        variant === "warning" && "bg-amber-500/10"
      )}>
        <Icon className={cn("w-5 h-5", iconColors[variant])} />
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  );
};
