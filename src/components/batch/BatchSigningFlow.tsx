import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Shield, Send, XCircle, ExternalLink } from "lucide-react";
import { IssuingWallet } from "@/types/token";
import { BatchTransaction, batchableTxTypeLabels, BatchAtomicityMode, atomicityModeLabels } from "@/types/batchTransaction";
import { SigningResponse } from "@/types/custody";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KeyStorageTypeBadge } from "@/components/custody/KeyStorageTypeBadge";
import { SigningPolicyPreview } from "@/components/custody/SigningPolicyPreview";
import { signingService } from "@/domain/services/SigningService";
import { buildUnsignedTransaction, validateTransactionParams } from "@/lib/xrplTransactionBuilder";
import { getSigningErrorMessage, getSuggestedAction, isRecoverableError } from "@/lib/signingErrors";
import { requiresMigration } from "@/types/custody";
import { toast } from "@/hooks/use-toast";

type FlowStep = "REVIEW" | "VALIDATING" | "SIGNING" | "COMPLETE" | "ERROR";

interface SigningResult {
  tx: BatchTransaction;
  response: SigningResponse;
}

interface BatchSigningFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: IssuingWallet;
  transactions: BatchTransaction[];
  batchName: string;
  atomicityMode: BatchAtomicityMode;
  onComplete: (results: SigningResult[]) => void;
}

export const BatchSigningFlow: React.FC<BatchSigningFlowProps> = ({
  open,
  onOpenChange,
  wallet,
  transactions,
  batchName,
  atomicityMode,
  onComplete,
}) => {
  const [step, setStep] = useState<FlowStep>("REVIEW");
  const [currentTxIndex, setCurrentTxIndex] = useState(0);
  const [results, setResults] = useState<SigningResult[]>([]);
  const [error, setError] = useState<{ message: string; code?: string; suggestion?: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep("REVIEW");
      setCurrentTxIndex(0);
      setResults([]);
      setError(null);
      setValidationErrors([]);
    }
  }, [open]);

  // Validate all transactions
  const validateBatch = (): boolean => {
    const errors: string[] = [];
    
    transactions.forEach((tx, index) => {
      const result = validateTransactionParams(tx.txType, tx.params);
      result.errors.forEach((err) => {
        errors.push(`Transaction ${index + 1} (${batchableTxTypeLabels[tx.txType]}): ${err}`);
      });
    });

    // Check for legacy wallet on mainnet
    if (requiresMigration(wallet.keyStorageType) && wallet.network === "mainnet") {
      errors.push("Legacy wallets cannot sign mainnet transactions. Migrate to vault storage first.");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Start the signing process
  const handleStartSigning = async () => {
    // First validate
    setStep("VALIDATING");
    await new Promise((r) => setTimeout(r, 500)); // Brief delay for UX

    if (!validateBatch()) {
      setStep("ERROR");
      setError({
        message: "Validation failed",
        suggestion: "Fix the errors above and try again.",
      });
      return;
    }

    // Start signing
    setStep("SIGNING");
    await signBatch();
  };

  // Sign all transactions in sequence
  const signBatch = async () => {
    const signedResults: SigningResult[] = [];

    for (let i = 0; i < transactions.length; i++) {
      setCurrentTxIndex(i);
      const tx = transactions[i];

      try {
        // Build unsigned transaction
        const unsigned = buildUnsignedTransaction(tx.txType, tx.params, wallet);

        // Call signing service
        const response = await signingService.signTransaction({
          walletId: wallet.id,
          txType: tx.txType,
          unsignedTxBlob: unsigned.txBlob,
          unsignedTxHash: unsigned.txHash,
          requestedBy: "current-user", // Would come from auth context
          requestedByName: "Current User",
          requestedByRole: "TOKENIZATION_MANAGER",
          amount: unsigned.amount,
          currency: unsigned.currency,
          destination: unsigned.destination,
          destinationName: unsigned.destinationName,
        });

        if (!response.success) {
          // Handle failure based on atomicity mode
          const errorCode = response.errorCode;
          const errorMsg = getSigningErrorMessage(errorCode);
          const suggestion = errorCode ? getSuggestedAction(errorCode) : undefined;

          if (atomicityMode === "ALL_OR_NOTHING") {
            // Stop on first failure
            setError({ message: errorMsg, code: errorCode, suggestion });
            setStep("ERROR");
            return;
          }

          // For other modes, continue but mark as failed
          signedResults.push({ tx, response });
          continue;
        }

        signedResults.push({ tx, response });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        
        if (atomicityMode === "ALL_OR_NOTHING") {
          setError({ message: errorMsg, suggestion: "Try again or contact support." });
          setStep("ERROR");
          return;
        }

        // Mark as failed and continue
        signedResults.push({
          tx,
          response: {
            success: false,
            error: errorMsg,
            errorCode: "INTERNAL_ERROR",
            auditLogId: "",
          },
        });
      }
    }

    // All done
    setResults(signedResults);
    setStep("COMPLETE");
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setResults([]);
    setStep("REVIEW");
  };

  // Handle completion
  const handleDone = () => {
    onComplete(results);
    onOpenChange(false);
    
    const successCount = results.filter((r) => r.response.success).length;
    toast({
      title: "Batch Signing Complete",
      description: `${successCount} of ${transactions.length} transactions signed successfully.`,
    });
  };

  const progress = step === "SIGNING" 
    ? ((currentTxIndex + 1) / transactions.length) * 100 
    : step === "COMPLETE" ? 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {step === "REVIEW" && "Review & Sign Batch"}
            {step === "VALIDATING" && "Validating..."}
            {step === "SIGNING" && "Signing Transactions"}
            {step === "COMPLETE" && "Signing Complete"}
            {step === "ERROR" && "Signing Failed"}
          </DialogTitle>
          <DialogDescription>
            {batchName} • {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Progress Bar */}
          {(step === "SIGNING" || step === "COMPLETE") && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {step === "SIGNING" 
                  ? `Signing ${currentTxIndex + 1} of ${transactions.length}...`
                  : "All transactions processed"}
              </p>
            </div>
          )}

          {/* Step: REVIEW */}
          {step === "REVIEW" && (
            <>
              {/* Wallet Info */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{wallet.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {wallet.xrplAddress.slice(0, 8)}...{wallet.xrplAddress.slice(-6)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <KeyStorageTypeBadge type={wallet.keyStorageType} size="sm" />
                  <Badge variant="outline" className="text-xs capitalize">
                    {wallet.network}
                  </Badge>
                </div>
              </div>

              {/* Legacy Warning */}
              {requiresMigration(wallet.keyStorageType) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Legacy Key Storage</AlertTitle>
                  <AlertDescription>
                    {wallet.network === "mainnet"
                      ? "This wallet cannot sign mainnet transactions. Migrate to vault storage."
                      : "This wallet uses legacy storage. Consider migrating to vault for enhanced security."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Atomicity Mode */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Atomicity Mode</span>
                <Badge variant="secondary">{atomicityModeLabels[atomicityMode]}</Badge>
              </div>

              <Separator />

              {/* Transaction List */}
              <div>
                <p className="text-sm font-medium mb-2">Transactions to Sign</p>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2 pr-4">
                    {transactions.map((tx, idx) => (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 p-2 rounded-md border bg-card"
                      >
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {batchableTxTypeLabels[tx.txType]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Object.keys(tx.params).length} params
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Policy Preview for first tx type */}
              {transactions.length > 0 && (
                <SigningPolicyPreview
                  walletRole={wallet.role}
                  network={wallet.network}
                  txType={transactions[0].txType}
                  compact
                />
              )}
            </>
          )}

          {/* Step: VALIDATING */}
          {step === "VALIDATING" && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Validating transactions and policies...
              </p>
            </div>
          )}

          {/* Step: SIGNING */}
          {step === "SIGNING" && (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {transactions.map((tx, idx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-2 rounded-md border bg-card"
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {idx < currentTxIndex ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : idx === currentTxIndex ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {batchableTxTypeLabels[tx.txType]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {idx < currentTxIndex
                          ? "Signed"
                          : idx === currentTxIndex
                          ? "Signing..."
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Step: COMPLETE */}
          {step === "COMPLETE" && (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {results.map((result, idx) => (
                  <div
                    key={result.tx.id}
                    className={`flex items-center gap-3 p-2 rounded-md border ${
                      result.response.success ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    {result.response.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {batchableTxTypeLabels[result.tx.txType]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.response.success
                          ? `Audit: ${result.response.auditLogId?.slice(0, 8)}...`
                          : result.response.error}
                      </p>
                    </div>
                    {result.response.success && result.response.auditLogId && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Step: ERROR */}
          {step === "ERROR" && (
            <div className="space-y-4">
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      {validationErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>{error.message}</AlertTitle>
                  {error.suggestion && (
                    <AlertDescription>{error.suggestion}</AlertDescription>
                  )}
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "REVIEW" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleStartSigning}
                disabled={requiresMigration(wallet.keyStorageType) && wallet.network === "mainnet"}
              >
                <Send className="h-4 w-4 mr-2" />
                Sign {transactions.length} Transaction{transactions.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}

          {(step === "VALIDATING" || step === "SIGNING") && (
            <Button variant="outline" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </Button>
          )}

          {step === "COMPLETE" && (
            <Button onClick={handleDone}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Done
            </Button>
          )}

          {step === "ERROR" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleRetry}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
