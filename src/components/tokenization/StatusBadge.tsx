import React from "react";
import { ProjectStatus, statusLabel, statusOrder } from "@/types/tokenization";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

const getStatusStyles = (status: ProjectStatus) => {
  const index = statusOrder.indexOf(status);
  const isMinted = status === "MINTED";
  const isEarly = index <= 1;
  const isMid = index > 1 && index < 5;

  if (isMinted) {
    return "bg-primary/10 text-primary border-primary/20 shadow-glow";
  }
  if (isEarly) {
    return "bg-status-pending/10 text-status-pending border-status-pending/20";
  }
  if (isMid) {
    return "bg-status-active/10 text-status-active border-status-active/20";
  }
  return "bg-status-complete/10 text-status-complete border-status-complete/20";
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border transition-all duration-200",
        getStatusStyles(status),
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      )}
    >
      {status === "MINTED" && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 status-pulse" />
      )}
      {statusLabel[status]}
    </span>
  );
};
