import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthorizedHolder } from "@/types/mptTransactions";
import { Role } from "@/types/tokenization";
import { RotateCcw, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClawbackFormProps {
  projectId: string;
  role: Role;
  canClawback: boolean;
  authorizedHolders: AuthorizedHolder[];
  holderBalances: Record<string, number>;
  onClawback: (holder: string, amount: number, reason: string) => void;
}

const canPerformClawback = (role: Role): boolean => {
  return role === "SUPER_ADMIN" || role === "COMPLIANCE_OFFICER";
};

export const ClawbackForm: React.FC<ClawbackFormProps> = ({
  role,
  canClawback,
  authorizedHolders,
  holderBalances,
  onClawback,
}) => {
  const [selectedHolder, setSelectedHolder] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeHolders = authorizedHolders.filter((h) => h.status === "AUTHORIZED");
  const selectedHolderBalance = selectedHolder ? (holderBalances[selectedHolder] || 0) : 0;

  const handleClawback = async () => {
    const numAmount = parseFloat(amount);
    
    if (!selectedHolder || isNaN(numAmount) || numAmount <= 0 || !reason.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (numAmount > selectedHolderBalance) {
      toast.error("Amount exceeds holder balance");
      return;
    }

    setIsSubmitting(true);
    try {
      onClawback(selectedHolder, numAmount, reason.trim());
      setSelectedHolder("");
      setAmount("");
      setReason("");
      toast.success("Clawback executed", {
        description: `${numAmount.toLocaleString()} tokens reclaimed from ${selectedHolder.slice(0, 8)}...`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canClawback) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h4 className="text-sm font-medium text-foreground mb-2">
          Clawback Disabled
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm">
          This token was created without the Clawback flag enabled. Token reclamation is not possible.
        </p>
      </div>
    );
  }

  if (!canPerformClawback(role)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">
          Only Compliance Officers and Super Admins can execute clawbacks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-amber-700">
            Clawback is a Compliance Action
          </h4>
          <p className="text-xs text-amber-600/80 mt-1">
            Clawback forcibly reclaims tokens from a holder's account. This action is logged for audit purposes and should only be used for regulatory compliance, fraud prevention, or legal requirements.
          </p>
        </div>
      </div>

      {/* Clawback Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="holder" className="text-xs font-medium">
            Holder Address
          </Label>
          <Select value={selectedHolder} onValueChange={setSelectedHolder}>
            <SelectTrigger className="text-xs font-mono">
              <SelectValue placeholder="Select holder to clawback from..." />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {activeHolders.map((holder) => (
                <SelectItem
                  key={holder.id}
                  value={holder.address}
                  className="text-xs font-mono"
                >
                  {holder.address.slice(0, 12)}...{holder.address.slice(-8)}
                  <span className="ml-2 text-muted-foreground">
                    ({(holderBalances[holder.address] || 0).toLocaleString()} tokens)
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedHolder && (
            <p className="text-[10px] text-muted-foreground">
              Balance: {selectedHolderBalance.toLocaleString()} tokens
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="text-xs font-medium">
            Amount to Clawback
          </Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={selectedHolderBalance}
              className="text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAmount(selectedHolderBalance.toString())}
              disabled={!selectedHolder}
            >
              All
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-xs font-medium">
            Reason for Clawback <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Describe the compliance or legal reason for this clawback..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="text-xs min-h-[80px]"
            required
          />
          <p className="text-[10px] text-muted-foreground">
            This reason will be recorded in the audit log for regulatory review.
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isSubmitting || !selectedHolder || !amount || !reason.trim()}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Execute Clawback
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Clawback</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to clawback <strong>{parseFloat(amount || "0").toLocaleString()}</strong> tokens
                from address <code className="text-xs">{selectedHolder?.slice(0, 12)}...</code>
                <br /><br />
                This action is irreversible and will be logged for audit purposes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClawback} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Confirm Clawback
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
