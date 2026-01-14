import React from "react";
import { format } from "date-fns";
import { WorkOrder } from "@/types/workOrder";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkOrderStatusBadge } from "./WorkOrderStatusBadge";
import { cn } from "@/lib/utils";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onRowClick: (workOrderId: string) => void;
}

const tokenTypeColors: Record<string, string> = {
  NFT: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  MPT: "bg-primary/10 text-primary border-primary/20",
};

const categoryLabels: Record<string, string> = {
  MAINTENANCE: "Maintenance",
  INSTALLATION: "Installation",
  PROFESSIONAL_SERVICES: "Prof. Services",
  AUDIT: "Audit",
};

export const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  workOrders,
  onRowClick,
}) => {
  if (workOrders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No work orders found.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Title</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((workOrder) => (
            <TableRow
              key={workOrder.id}
              onClick={() => onRowClick(workOrder.id)}
              className="cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-xs",
                      tokenTypeColors[workOrder.tokenType]
                    )}
                  >
                    {workOrder.tokenType}
                  </Badge>
                  <span className="font-medium text-foreground">
                    {workOrder.title}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-foreground">
                  {workOrder.businessName}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-foreground">
                  {workOrder.assigneeName || (
                    <span className="text-muted-foreground italic">
                      Unassigned
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-medium text-foreground">
                  ${workOrder.agreedAmountUsd.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {workOrder.category
                    ? categoryLabels[workOrder.category] || workOrder.category
                    : "—"}
                </span>
              </TableCell>
              <TableCell>
                <WorkOrderStatusBadge status={workOrder.status} />
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(workOrder.createdAt), "MMM d, yyyy")}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
