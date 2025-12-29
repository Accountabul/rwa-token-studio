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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download, Shield } from "lucide-react";

interface ExportReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  exportType: "CSV" | "JSON" | "PDF";
  rowCount: number;
  reportName?: string;
  isLoading?: boolean;
}

export const ExportReasonModal: React.FC<ExportReasonModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  exportType,
  rowCount,
  reportName,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (reason.trim().length < 10) {
      setError("Please provide a reason with at least 10 characters");
      return;
    }
    setError(null);
    onConfirm(reason.trim());
    setReason("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Export Justification Required
          </DialogTitle>
          <DialogDescription>
            This export will be logged for compliance purposes. Please provide a
            business justification for this data export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Export Summary */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
            <Download className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {reportName ?? "Data Export"}
              </p>
              <p className="text-xs text-muted-foreground">
                {rowCount.toLocaleString()} rows • {exportType} format
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {exportType}
            </Badge>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-700">
              <p className="font-medium">Audit Notice</p>
              <p className="mt-0.5">
                This export will be recorded in the audit log with your user ID,
                timestamp, and the reason you provide below.
              </p>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="export-reason">
              Business Justification <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="export-reason"
              placeholder="e.g., Preparing Q4 financial reconciliation for external audit..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error && e.target.value.trim().length >= 10) {
                  setError(null);
                }
              }}
              className="min-h-[100px] resize-none"
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters required
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || reason.trim().length < 10}
            className="gap-2"
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {exportType}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
