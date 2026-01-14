import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AssignWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder;
  onSuccess?: () => void;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  job_title: string | null;
  department: string | null;
}

export const AssignWorkOrderDialog: React.FC<AssignWorkOrderDialogProps> = ({
  open,
  onOpenChange,
  workOrder,
  onSuccess,
}) => {
  const { profile, roles } = useAuth();
  const workOrderService = useWorkOrderService();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigneeId, setAssigneeId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch employees (technicians and other staff) from profiles
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        // Fetch profiles - in production, you'd filter by TECHNICIAN role
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, job_title, department")
          .eq("status", "ACTIVE")
          .order("full_name");

        if (error) throw error;
        setEmployees(data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
        // Fallback to empty list
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const selectedEmployee = employees.find((e) => e.id === assigneeId);

  const handleAssigneeChange = (id: string) => {
    setAssigneeId(id);
    // Wallet address needs to be entered manually
  };

  const handleSubmit = async () => {
    if (!profile || !selectedEmployee) return;

    setIsSubmitting(true);
    try {
      await workOrderService.assignWorkOrder(
        workOrder.id,
        selectedEmployee.id,
        selectedEmployee.full_name,
        walletAddress,
        {
          userId: profile.id,
          name: profile.full_name,
          role: roles[0] || "OPERATIONS_ADMIN",
        }
      );

      toast({
        title: "Work Order Assigned",
        description: `Assigned to ${selectedEmployee.full_name}.`,
      });

      onOpenChange(false);
      setAssigneeId("");
      setWalletAddress("");
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
            Assign "{workOrder.title}" to a technician or staff member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee (Technician)</Label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading employees...
              </div>
            ) : (
              <Select value={assigneeId} onValueChange={handleAssigneeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a technician..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <div className="py-2 px-2 text-sm text-muted-foreground">
                      No employees found
                    </div>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex flex-col">
                          <span>{employee.full_name}</span>
                          {employee.job_title && (
                            <span className="text-xs text-muted-foreground">
                              {employee.job_title}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {selectedEmployee && (
              <p className="text-xs text-muted-foreground">
                {selectedEmployee.email}
                {selectedEmployee.department && ` • ${selectedEmployee.department}`}
              </p>
            )}
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
            <p className="text-xs text-muted-foreground">
              The wallet address for receiving payment upon completion.
            </p>
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
