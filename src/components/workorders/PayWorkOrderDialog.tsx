import React, { useState } from "react";
import { Wallet } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkOrder } from "@/types/workOrder";
import { useWorkOrderService } from "@/domain/ServiceContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface PayWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder;
  onSuccess?: () => void;
}

type PaymentRail = "XRPL" | "STRIPE" | "ACH" | "WIRE";

const paymentRails: { value: PaymentRail; label: string }[] = [
  { value: "XRPL", label: "XRPL (Crypto)" },
  { value: "STRIPE", label: "Stripe" },
  { value: "ACH", label: "ACH Transfer" },
  { value: "WIRE", label: "Wire Transfer" },
];

export const PayWorkOrderDialog: React.FC<PayWorkOrderDialogProps> = ({
  open,
  onOpenChange,
  workOrder,
  onSuccess,
}) => {
  const { profile, roles } = useAuth();
  const workOrderService = useWorkOrderService();

  const [rail, setRail] = useState<PaymentRail>("XRPL");
  const [processorRef, setProcessorRef] = useState("");
  const [xrplTxHash, setXrplTxHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate fees (2.5% platform fee)
  const feeAmount = workOrder.agreedAmountUsd * 0.025;
  const netAmount = workOrder.agreedAmountUsd - feeAmount;

  const handleSubmit = async () => {
    if (!profile) return;

    setIsSubmitting(true);
    try {
      await workOrderService.payWorkOrder(
        workOrder.id,
        {
          userId: profile.id,
          name: profile.full_name,
          role: roles[0] || "FINANCE_OFFICER",
        },
        {
          rail,
          processorRef: processorRef.trim() || undefined,
          xrplTxHash: rail === "XRPL" ? xrplTxHash.trim() || undefined : undefined,
        }
      );

      toast({
        title: "Payment Recorded",
        description: `Payment of $${netAmount.toLocaleString()} has been recorded.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record payment for "{workOrder.title}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Agreed Amount</span>
              <span className="font-medium">
                ${workOrder.agreedAmountUsd.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (2.5%)</span>
              <span className="text-red-600">-${feeAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-medium">Net to Assignee</span>
              <span className="font-bold text-emerald-600">
                ${netAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rail">Payment Rail</Label>
            <Select
              value={rail}
              onValueChange={(v) => setRail(v as PaymentRail)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method..." />
              </SelectTrigger>
              <SelectContent>
                {paymentRails.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="processorRef">Processor Reference (Optional)</Label>
            <Input
              id="processorRef"
              value={processorRef}
              onChange={(e) => setProcessorRef(e.target.value)}
              placeholder="e.g., pi_1234567890"
            />
          </div>

          {rail === "XRPL" && (
            <div className="space-y-2">
              <Label htmlFor="xrplTxHash">XRPL Transaction Hash</Label>
              <Input
                id="xrplTxHash"
                value={xrplTxHash}
                onChange={(e) => setXrplTxHash(e.target.value)}
                placeholder="Enter XRPL transaction hash..."
                className="font-mono text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Recording..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
