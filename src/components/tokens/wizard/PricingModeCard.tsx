import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { PricingMode } from "@/types/tokenPricing";

interface PricingModeCardProps {
  mode: PricingMode;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
}

export const PricingModeCard: React.FC<PricingModeCardProps> = ({
  mode,
  title,
  description,
  isSelected,
  onSelect,
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left w-full",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="h-5 w-5 text-primary" />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        "p-2 rounded-lg mb-3",
        isSelected ? "bg-primary/10" : "bg-muted"
      )}>
        {icon}
      </div>

      {/* Content */}
      <h4 className={cn(
        "font-medium mb-1",
        isSelected ? "text-primary" : "text-foreground"
      )}>
        {title}
      </h4>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Mode badge */}
      {mode === "FAIR_VALUE" && (
        <span className="mt-3 text-[10px] uppercase tracking-wider font-medium text-primary/70 bg-primary/10 px-2 py-0.5 rounded">
          Recommended
        </span>
      )}
    </button>
  );
};
