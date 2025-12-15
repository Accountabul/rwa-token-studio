import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { getDeviationSeverity, DeviationSeverity } from "@/lib/pricingCalculator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PriceDeviationBadgeProps {
  deviationPercent: number;
  showTooltip?: boolean;
}

const severityStyles: Record<DeviationSeverity, { bg: string; text: string; icon: React.ReactNode }> = {
  none: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  low: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  high: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const severityMessages: Record<DeviationSeverity, string> = {
  none: "Price is within expected range",
  low: "Minor deviation, acceptable for most use cases",
  medium: "Moderate deviation, may require disclosure to investors",
  high: "Significant deviation requires explicit acknowledgment",
};

export const PriceDeviationBadge: React.FC<PriceDeviationBadgeProps> = ({
  deviationPercent,
  showTooltip = true,
}) => {
  const severity = getDeviationSeverity(deviationPercent);
  const styles = severityStyles[severity];
  const isPositive = deviationPercent > 0;
  const absDeviation = Math.abs(deviationPercent).toFixed(1);

  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const badge = (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      styles.bg,
      styles.text
    )}>
      {styles.icon}
      <TrendIcon className="h-3 w-3" />
      <span>{isPositive ? "+" : "-"}{absDeviation}%</span>
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{severityMessages[severity]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
