import React from "react";
import { format } from "date-fns";
import { Escrow, escrowStatusLabel, escrowAssetTypeLabel, escrowConditionLabel } from "@/types/escrow";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface EscrowTableProps {
  escrows: Escrow[];
  onRowClick: (escrowId: string) => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",
  EXPIRED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const assetTypeColors: Record<string, string> = {
  XRP: "bg-primary/10 text-primary border-primary/20",
  IOU: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  MPT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export const EscrowTable: React.FC<EscrowTableProps> = ({ escrows, onRowClick }) => {
  if (escrows.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No escrows found.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Asset</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Unlock Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {escrows.map((escrow) => (
            <TableRow
              key={escrow.id}
              onClick={() => onRowClick(escrow.id)}
              className="cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("font-mono text-xs", assetTypeColors[escrow.assetType])}>
                    {escrow.assetType}
                  </Badge>
                  {escrow.tokenSymbol && (
                    <span className="text-sm text-foreground font-medium">{escrow.tokenSymbol}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <span className="font-medium text-foreground">
                    {escrow.amount.toLocaleString()}
                  </span>
                  {escrow.amountUsd && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (${escrow.amountUsd.toLocaleString()})
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-foreground">{escrow.destinationName || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                    {escrow.destinationAddress.slice(0, 8)}...{escrow.destinationAddress.slice(-4)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {escrowConditionLabel[escrow.conditionType]}
                </span>
              </TableCell>
              <TableCell>
                {escrow.finishAfter ? (
                  <span className="text-sm text-foreground">
                    {format(new Date(escrow.finishAfter), "MMM d, yyyy")}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("text-xs", statusColors[escrow.status])}>
                  {escrowStatusLabel[escrow.status]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
