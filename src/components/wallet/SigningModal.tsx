import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Loader2, Shield, XCircle, Info } from "lucide-react";
import { PendingMultiSignTx, multiSignTxTypeLabel } from "@/types/multiSign";
import { SigningResponse } from "@/types/custody";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signingService } from "@/domain/services/SigningService";
import { getSigningErrorMessage, getSuggestedAction } from "@/lib/signingErrors";
import { hashUnsignedTransaction } from "@/lib/xrplTransactionBuilder";
import { toast } from "@/hooks/use-toast";

interface SigningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: PendingMultiSignTx;
  onSignSuccess?: (response: SigningResponse) => void;
}

export const SigningModal: React.FC<SigningModalProps> = ({ 
  open, 
  onOpenChange, 
  transaction,
  onSignSuccess,
}) => {
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSuggestion, setErrorSuggestion] = useState<string | null>(null);

  const handleSign = async () => {
    setSigning(true);
    setError(null);
    setErrorSuggestion(null);

    try {
      // Build the unsigned tx hash from the blob
      const unsignedTxHash = transaction.txBlob 
        ? hashUnsignedTransaction(transaction.txBlob) 
        : `MOCK_HASH_${Date.now()}`;

      // Call the real signing service
      const response = await signingService.signTransaction({
        walletId: transaction.walletId,
        txType: transaction.txType,
        unsignedTxBlob: transaction.txBlob || "",
        unsignedTxHash,
        requestedBy: "current-user", // Would come from auth context
        requestedByName: "Current User",
        requestedByRole: "TOKENIZATION_MANAGER",
        amount: transaction.amount,
        currency: transaction.amountCurrency,
        destination: transaction.destination,
        destinationName: transaction.destinationName,
      });

      if (!response.success) {
        const errorCode = response.errorCode;
        setError(getSigningErrorMessage(errorCode));
        if (errorCode) {
          setErrorSuggestion(getSuggestedAction(errorCode));
        }
        setSigning(false);
        return;
      }

      // Success!
      setSigning(false);
      onOpenChange(false);
      onSignSuccess?.(response);
      
      toast({
        title: "Transaction Signed",
        description: response.policyApplied
          ? `Policy applied: ${response.policyApplied}`
          : "Your signature has been added to the transaction.",
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMsg);
      setErrorSuggestion("Try again or contact support.");
      setSigning(false);
    }
  };

  const progressPercent = (transaction.currentWeight / transaction.requiredWeight) * 100;
  const newProgressPercent = Math.min(100, ((transaction.currentWeight + 1) / transaction.requiredWeight) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Sign Transaction
          </DialogTitle>
          <DialogDescription>
            Review the transaction details before signing.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">{error}</p>
                {errorSuggestion && (
                  <p className="text-sm mt-1 opacity-90">{errorSuggestion}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Transaction Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Type</span>
            <Badge variant="outline">{multiSignTxTypeLabel[transaction.txType]}</Badge>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm font-medium text-foreground">{transaction.description}</p>
          </div>

          {/* Amount */}
          {transaction.amount && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-semibold text-foreground">
                {transaction.amount.toLocaleString()} {transaction.amountCurrency}
              </span>
            </div>
          )}

          {/* Destination */}
          {transaction.destinationName && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Destination</span>
              <span className="text-sm font-medium">{transaction.destinationName}</span>
            </div>
          )}

          <Separator />

          {/* Signature Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Signature Progress</span>
              <span className="font-medium">
                {transaction.currentWeight} → {transaction.currentWeight + 1} / {transaction.requiredWeight}
              </span>
            </div>
            <div className="relative">
              <Progress value={progressPercent} className="h-2" />
              <div
                className="absolute top-0 left-0 h-2 bg-green-500/50 rounded-full transition-all"
                style={{ width: `${newProgressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {transaction.currentWeight + 1 >= transaction.requiredWeight
                ? "Your signature will make this transaction ready for execution!"
                : `${transaction.requiredWeight - transaction.currentWeight - 1} more signature(s) needed after yours.`}
            </p>
          </div>

          {/* Current Signatures */}
          {transaction.signatures.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Signatures</p>
              <div className="flex flex-wrap gap-1">
                {transaction.signatures.map((sig) => (
                  <Badge key={sig.signerId} variant="secondary" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                    {sig.signerName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail Info */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 border border-border rounded-lg">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              This signature will be recorded in the signing audit log for compliance and security tracking.
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-700">
              By signing, you confirm that you have reviewed the transaction details and authorize this action.
              Signatures cannot be revoked.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={signing}>
            Cancel
          </Button>
          <Button onClick={handleSign} disabled={signing} className="gap-2">
            {signing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Sign Transaction
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
