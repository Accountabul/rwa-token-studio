import React from "react";
import { InvestorWallet } from "@/types/investor";
import { DollarSign, Building2, Coins, Wrench, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WalletValuePanelProps {
  wallet: InvestorWallet;
}

export const WalletValuePanel: React.FC<WalletValuePanelProps> = ({ wallet }) => {
  if (!wallet.totalValueUsd || wallet.permissionDexStatus !== "APPROVED") {
    return null;
  }

  const breakdown = wallet.breakdown || { projectTokens: 0, stablecoins: 0, utilityTokens: 0 };
  const total = wallet.totalValueUsd;

  const formatUsd = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const valuationSourceLabel = {
    oracle: "Oracle Price",
    last_trade: "Last Trade",
    issuance_price: "Issuance Price",
  };

  return (
    <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Wallet Value</span>
        </div>
        <span className="text-lg font-semibold text-foreground">{formatUsd(total)}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-md bg-background/50 border border-border/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Building2 className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Project</span>
          </div>
          <p className="text-sm font-medium text-foreground">{formatUsd(breakdown.projectTokens)}</p>
        </div>
        <div className="p-2 rounded-md bg-background/50 border border-border/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Coins className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Stable</span>
          </div>
          <p className="text-sm font-medium text-foreground">{formatUsd(breakdown.stablecoins)}</p>
        </div>
        <div className="p-2 rounded-md bg-background/50 border border-border/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Wrench className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Utility</span>
          </div>
          <p className="text-sm font-medium text-foreground">{formatUsd(breakdown.utilityTokens)}</p>
        </div>
      </div>

      {wallet.valuationSource && (
        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-help">
                  <Info className="w-3 h-3" />
                  Source: {valuationSourceLabel[wallet.valuationSource]}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Valuation based on {valuationSourceLabel[wallet.valuationSource].toLowerCase()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};
