import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Upload, DollarSign, FileText } from "lucide-react";
import { toast } from "sonner";

interface ManualPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ManualPayoutData) => Promise<void>;
}

export interface ManualPayoutData {
  payeeId: string;
  payeeName: string;
  amount: number;
  currency: string;
  memo: string;
  evidenceUri: string;
  earningCategory: string;
}

const EARNING_CATEGORIES = [
  { value: "CONTRACTOR_COMP", label: "Contractor Compensation" },
  { value: "VENDOR_PAYOUT", label: "Vendor Payout" },
  { value: "TIP", label: "Tip" },
  { value: "BOUNTY", label: "Bounty" },
  { value: "REFERRAL_REWARD", label: "Referral Reward" },
  { value: "OTHER", label: "Other" },
];

export const ManualPayoutDialog: React.FC<ManualPayoutDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ManualPayoutData>>({
    currency: "USD",
    earningCategory: "CONTRACTOR_COMP",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.payeeName?.trim()) {
      newErrors.payeeName = "Payee name is required";
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Valid amount is required";
    }
    if (!formData.memo?.trim()) {
      newErrors.memo = "Memo/description is required";
    }
    if (!formData.evidenceUri?.trim()) {
      newErrors.evidenceUri = "Evidence document is required for manual payouts";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        payeeId: `payee-${Date.now()}`, // Would come from payee selector in real impl
        payeeName: formData.payeeName!,
        amount: formData.amount!,
        currency: formData.currency!,
        memo: formData.memo!,
        evidenceUri: formData.evidenceUri!,
        earningCategory: formData.earningCategory!,
      });
      toast.success("Manual payout recorded successfully");
      handleClose();
    } catch (error) {
      toast.error("Failed to record payout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ currency: "USD", earningCategory: "CONTRACTOR_COMP" });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Record Manual Payout
          </DialogTitle>
          <DialogDescription>
            Record a payout made outside of the standard payment rails. Evidence
            documentation is required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Banner */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-700">
              <p className="font-medium">Manual Payout Notice</p>
              <p className="mt-0.5">
                This action will create an audit record and ledger entry. Evidence
                documentation must be provided to comply with financial controls.
              </p>
            </div>
          </div>

          {/* Payee Name */}
          <div className="space-y-2">
            <Label htmlFor="payee-name">
              Payee Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="payee-name"
              placeholder="Enter payee name or business"
              value={formData.payeeName ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, payeeName: e.target.value })
              }
            />
            {errors.payeeName && (
              <p className="text-xs text-destructive">{errors.payeeName}</p>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.amount ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Earning Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Earning Category</Label>
            <Select
              value={formData.earningCategory}
              onValueChange={(value) =>
                setFormData({ ...formData, earningCategory: value })
              }
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EARNING_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo">
              Memo / Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="memo"
              placeholder="Describe the purpose of this payout..."
              value={formData.memo ?? ""}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              className="min-h-[80px] resize-none"
            />
            {errors.memo && (
              <p className="text-xs text-destructive">{errors.memo}</p>
            )}
          </div>

          {/* Evidence URI */}
          <div className="space-y-2">
            <Label htmlFor="evidence" className="flex items-center gap-2">
              Evidence Document <span className="text-destructive">*</span>
              <Badge variant="outline" className="text-[10px]">
                Required
              </Badge>
            </Label>
            <div className="flex gap-2">
              <Input
                id="evidence"
                placeholder="https://storage.example.com/evidence/..."
                value={formData.evidenceUri ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, evidenceUri: e.target.value })
                }
                className="flex-1"
              />
              <Button variant="outline" size="icon" type="button">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {errors.evidenceUri && (
              <p className="text-xs text-destructive">{errors.evidenceUri}</p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Link to invoice, receipt, or approval documentation
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>Recording...</>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Record Payout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
