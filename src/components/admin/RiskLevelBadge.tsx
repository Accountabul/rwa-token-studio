import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  RiskLevel, 
  riskLevelLabel,
} from "@/types/userManagement";
import { 
  Shield, 
  AlertTriangle, 
  Flame 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskLevelBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const riskIcon: Record<RiskLevel, React.ReactNode> = {
  NORMAL: null,
  ELEVATED: <AlertTriangle className="w-3.5 h-3.5" />,
  DANGEROUS: <Flame className="w-3.5 h-3.5" />,
};

const riskBgColor: Record<RiskLevel, string> = {
  NORMAL: "bg-muted text-muted-foreground",
  ELEVATED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  DANGEROUS: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({
  level,
  showIcon = true,
  showLabel = true,
  size = "md",
  className,
}) => {
  if (level === "NORMAL" && !showLabel) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "border-0 gap-1",
        riskBgColor[level],
        size === "sm" && "text-xs px-1.5 py-0",
        className
      )}
    >
      {showIcon && riskIcon[level]}
      {showLabel && riskLevelLabel[level]}
    </Badge>
  );
};
