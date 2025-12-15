import React from "react";
import { TokenStatus, TokenStandard, tokenStatusLabel, tokenStandardLabel } from "@/types/token";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TokenStatusBadgeProps {
  status: TokenStatus;
  className?: string;
}

export const TokenStatusBadge: React.FC<TokenStatusBadgeProps> = ({ status, className }) => {
  const statusStyles: Record<TokenStatus, string> = {
    DRAFT: "bg-muted text-muted-foreground border-muted-foreground/30",
    ISSUED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    FROZEN: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    RETIRED: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("text-[10px] font-medium", statusStyles[status], className)}
    >
      {tokenStatusLabel[status]}
    </Badge>
  );
};

interface TokenStandardBadgeProps {
  standard: TokenStandard;
  className?: string;
}

export const TokenStandardBadge: React.FC<TokenStandardBadgeProps> = ({ standard, className }) => {
  const standardStyles: Record<TokenStandard, string> = {
    IOU: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    MPT: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    NFT: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("text-[10px] font-medium", standardStyles[standard], className)}
    >
      {standard}
    </Badge>
  );
};
