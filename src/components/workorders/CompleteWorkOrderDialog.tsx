import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkOrder } from "@/types/workOrder";
import { useWorkOrderService } from "@/domain/ServiceContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface CompleteWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder;
  onSuccess?: () => void;
}

export const CompleteWorkOrderDialog: React.FC<CompleteWorkOrderDialogProps> = ({
  open,
  onOpenChange,
  workOrder,
  onSuccess,
}) => {
  const { profile, roles } = useAuth();
  const workOrderService = useWorkOrderService();

  const [xrplTxHash, setXrplTxHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!profile) return;

    setIsSubmitting(true);
    try {
      await workOrderService.completeWorkOrder(
        workOrder.id,
        {
          userId: profile.id,
          name: profile.full_name,
          role: roles[0] || "OPERATIONS_ADMIN",
        },
        xrplTxHash.trim() || undefined
      );

      toast({
        title: "Work Order Completed",
        description: `"${workOrder.title}" has been marked as completed.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Complete Work Order
          </DialogTitle>
          <DialogDescription>
            Mark "{workOrder.title}" as completed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business</span>
              <span className="font-medium">{workOrder.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assignee</span>
              <span className="font-medium">{workOrder.assigneeName || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                ${workOrder.agreedAmountUsd.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="txHash">XRPL Transaction Hash (Optional)</Label>
            <Input
              id="txHash"
              value={xrplTxHash}
              onChange={(e) => setXrplTxHash(e.target.value)}
              placeholder="Enter completion proof transaction hash..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Provide an on-chain transaction hash as proof of work completion.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Completing..." : "Mark as Completed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
