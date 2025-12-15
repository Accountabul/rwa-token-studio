import React from "react";
import { InvestorHolding, InvestorWallet } from "@/types/investor";
import { Briefcase, Lock, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PlatformHoldingsSectionProps {
  holdings: InvestorHolding[];
  wallets: InvestorWallet[];
}

export const PlatformHoldingsSection: React.FC<PlatformHoldingsSectionProps> = ({
  holdings,
  wallets,
}) => {
  const getWallet = (walletId: string) => wallets.find((w) => w.id === walletId);

  const formatUsd = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValueUsd, 0);
  const lockedCount = holdings.filter((h) => h.status === "LOCKED").length;
  const activeCount = holdings.filter((h) => h.status === "ACTIVE").length;
  const projectCount = new Set(holdings.map((h) => h.projectId)).size;

  const statusConfig = {
    ACTIVE: { label: "Active", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    LOCKED: { label: "Locked", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    PENDING: { label: "Pending", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  };

  const tokenTypeConfig = {
    OWNERSHIP: { label: "Ownership", className: "bg-primary/10 text-primary border-primary/20" },
    UTILITY: { label: "Utility", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    REVENUE: { label: "Revenue", className: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">
            Platform Assets & Holdings
          </h4>
        </div>
        <span className="text-xs text-muted-foreground">
          {holdings.length} asset{holdings.length !== 1 && "s"}
        </span>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Value</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{formatUsd(totalValue)}</p>
        </div>
        <div className="text-center border-x border-border/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {activeCount} Active / {lockedCount} Locked
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Projects</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{projectCount}</p>
        </div>
      </div>

      {holdings.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          No assets held on this platform.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-[11px] font-medium">Asset / Project</TableHead>
                <TableHead className="text-[11px] font-medium">Type</TableHead>
                <TableHead className="text-[11px] font-medium text-right">Quantity</TableHead>
                <TableHead className="text-[11px] font-medium text-right">Entry $</TableHead>
                <TableHead className="text-[11px] font-medium text-right">Current</TableHead>
                <TableHead className="text-[11px] font-medium">Status</TableHead>
                <TableHead className="text-[11px] font-medium">Wallet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => {
                const wallet = getWallet(holding.walletId);
                return (
                  <TableRow key={holding.id} className="text-xs">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{holding.tokenSymbol}</p>
                        <p className="text-[10px] text-muted-foreground">{holding.projectName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${tokenTypeConfig[holding.tokenType].className}`}>
                        {tokenTypeConfig[holding.tokenType].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {holding.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatUsd(holding.entryPriceUsd)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-mono">{formatUsd(holding.entryPriceUsd)}</p>
                        <p className="text-[10px] text-muted-foreground">
                          ({formatUsd(holding.currentValueUsd)})
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusConfig[holding.status].className}`}>
                        {statusConfig[holding.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {wallet && (
                        <code className="text-[10px] font-mono text-muted-foreground">
                          {wallet.xrplAddress.slice(0, 6)}...
                        </code>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
