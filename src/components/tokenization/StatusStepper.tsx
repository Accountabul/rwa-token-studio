import React from "react";
import { ProjectStatus, statusLabel, statusOrder } from "@/types/tokenization";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

interface StatusStepperProps {
  current: ProjectStatus;
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ current }) => {
  const currentIndex = statusOrder.indexOf(current);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {statusOrder.map((status, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <React.Fragment key={status}>
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-300",
                isActive && "bg-primary/10 text-primary border border-primary/30",
                isCompleted && "bg-status-complete/10 text-status-complete",
                !isActive && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-status-complete text-white",
                  !isActive && !isCompleted && "border border-muted-foreground/30"
                )}
              >
                {isCompleted ? (
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                ) : isActive ? (
                  <Circle className="w-2 h-2 fill-current" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="hidden sm:inline">{statusLabel[status]}</span>
            </div>
            {index < statusOrder.length - 1 && (
              <div
                className={cn(
                  "w-4 h-0.5 rounded-full transition-all duration-300",
                  isCompleted ? "bg-status-complete" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
