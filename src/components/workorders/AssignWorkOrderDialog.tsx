import React, { useState } from "react";
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
import { mockInvestors } from "@/data/mockInvestors";
import { useWorkOrderService } from "@/domain/ServiceContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface AssignWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder;
  onSuccess?: () => void;
}

export const AssignWorkOrderDialog: React.FC<AssignWorkOrderDialogProps> = ({
  open,
  onOpenChange,
  workOrder,
  onSuccess,
}) => {
  const { profile, roles } = useAuth();
  const workOrderService = useWorkOrderService();

  const [assigneeId, setAssigneeId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAssignee = mockInvestors.find((i) => i.id === assigneeId);

  const handleAssigneeChange = (id: string) => {
    setAssigneeId(id);
    // Wallet address needs to be entered manually
  };

  const handleSubmit = async () => {
    if (!profile || !selectedAssignee) return;

    setIsSubmitting(true);
    try {
      await workOrderService.assignWorkOrder(
        workOrder.id,
        selectedAssignee.id,
        selectedAssignee.fullName,
        walletAddress,
        {
          userId: profile.id,
          name: profile.full_name,
          role: roles[0] || "OPERATIONS_ADMIN",
        }
      );

      toast({
        title: "Work Order Assigned",
        description: `Assigned to ${selectedAssignee.fullName}.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = assigneeId !== "" && walletAddress.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Work Order</DialogTitle>
          <DialogDescription>
            Assign "{workOrder.title}" to a contractor or service provider.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={assigneeId} onValueChange={handleAssigneeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee..." />
              </SelectTrigger>
              <SelectContent>
              {mockInvestors.map((investor) => (
                  <SelectItem key={investor.id} value={investor.id}>
                    {investor.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet">XRPL Wallet Address</Label>
            <Input
              id="wallet"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
