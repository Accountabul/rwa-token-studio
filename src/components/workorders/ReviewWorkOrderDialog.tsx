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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WorkOrder } from "@/types/workOrder";
import { useWorkOrderService } from "@/domain/ServiceContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

interface ReviewWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder;
  onSuccess?: () => void;
}

export const ReviewWorkOrderDialog: React.FC<ReviewWorkOrderDialogProps> = ({
  open,
  onOpenChange,
  workOrder,
  onSuccess,
}) => {
  const { profile, roles } = useAuth();
  const workOrderService = useWorkOrderService();

  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!profile) return;

    setIsSubmitting(true);
    try {
      await workOrderService.reviewWorkOrder(
        workOrder.id,
        {
          userId: profile.id,
          name: profile.full_name,
          role: roles[0] || "OPERATIONS_ADMIN",
        },
        reviewNotes || undefined
      );

      toast({
        title: "Work Order Reviewed",
        description: "The work order has been reviewed and marked as completed.",
      });

      onOpenChange(false);
      setReviewNotes("");
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to review work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Review Work Order
          </DialogTitle>
          <DialogDescription>
            Review "{workOrder.title}" and approve to mark it as completed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Assignee</span>
              <span className="font-medium">{workOrder.assigneeName || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Agreed Amount</span>
              <span className="font-medium">${workOrder.agreedAmountUsd.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{workOrder.category || "—"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
            <Textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any notes about the review..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Reviewing..." : "Approve & Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
