import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MPTTransaction, MPTTransactionType } from "@/types/mptTransactions";
import {
  History,
  ExternalLink,
  Filter,
  Download,
  Coins,
  UserPlus,
  Trash2,
  Settings,
  Send,
  RotateCcw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionHistoryProps {
  projectId: string;
  transactions: MPTTransaction[];
}

const txTypeConfig: Record<
  MPTTransactionType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  MPTokenIssuanceCreate: {
    label: "Token Created",
    icon: <Coins className="w-3.5 h-3.5" />,
    color: "bg-primary/10 text-primary",
  },
  MPTokenAuthorize: {
    label: "Holder Authorized",
    icon: <UserPlus className="w-3.5 h-3.5" />,
    color: "bg-blue-500/10 text-blue-600",
  },
  MPTokenIssuanceDestroy: {
    label: "Token Destroyed",
    icon: <Trash2 className="w-3.5 h-3.5" />,
    color: "bg-destructive/10 text-destructive",
  },
  MPTokenIssuanceSet: {
    label: "Lock/Unlock",
    icon: <Settings className="w-3.5 h-3.5" />,
    color: "bg-amber-500/10 text-amber-600",
  },
  Payment: {
    label: "Distribution",
    icon: <Send className="w-3.5 h-3.5" />,
    color: "bg-green-500/10 text-green-600",
  },
  Clawback: {
    label: "Clawback",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    color: "bg-orange-500/10 text-orange-600",
  },
};

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
}) => {
  const [filter, setFilter] = useState<MPTTransactionType | "all">("all");

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((tx) => tx.type === filter);

  const handleExport = () => {
    const csv = [
      "Timestamp,Type,TX Hash,Actor,Role,Details",
      ...filteredTransactions.map(
        (tx) =>
          `"${tx.timestamp}","${tx.type}","${tx.txHash}","${tx.actor}","${tx.actorRole}","${JSON.stringify(tx.details).replace(/"/g, '""')}"`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `token-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            Transaction History
          </h4>
          <Badge variant="secondary" className="text-[10px]">
            {filteredTransactions.length} transactions
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as MPTTransactionType | "all")}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <Filter className="w-3 h-3 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all" className="text-xs">
                All Types
              </SelectItem>
              {Object.entries(txTypeConfig).map(([type, config]) => (
                <SelectItem key={type} value={type} className="text-xs">
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg">
          <History className="w-10 h-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No transactions found</p>
          {filter !== "all" && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setFilter("all")}
              className="mt-2"
            >
              Clear filter
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredTransactions.map((tx) => {
            const config = txTypeConfig[tx.type];
            return (
              <div
                key={tx.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {config.label}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {tx.actorRole.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {tx.timestamp} by {tx.actor}
                      </p>

                      {/* Transaction Details */}
                      {tx.details.destination && (
                        <p className="text-xs text-muted-foreground mt-2">
                          To:{" "}
                          <code className="font-mono">
                            {tx.details.destination.slice(0, 10)}...
                            {tx.details.destination.slice(-6)}
                          </code>
                        </p>
                      )}
                      {tx.details.amount !== undefined && (
                        <p className="text-xs text-foreground font-medium">
                          Amount: {tx.details.amount.toLocaleString()} tokens
                        </p>
                      )}
                      {tx.details.reason && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          "{tx.details.reason}"
                        </p>
                      )}
                      {tx.details.lockType && (
                        <p className="text-xs text-muted-foreground">
                          Lock type: {tx.details.lockType} -{" "}
                          {tx.details.isLocked ? "Locked" : "Unlocked"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* TX Hash Link */}
                  <a
                    href={`https://testnet.xrpl.org/transactions/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                  >
                    <code className="font-mono">
                      {tx.txHash.slice(0, 8)}...
                    </code>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
