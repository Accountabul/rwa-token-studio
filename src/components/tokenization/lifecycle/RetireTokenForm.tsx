import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Role } from "@/types/tokenization";
import { TokenBalance } from "@/types/mptTransactions";
import { Trash2, AlertTriangle, CheckCircle2, XCircle, Shield } from "lucide-react";
import { toast } from "sonner";
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

interface RetireTokenFormProps {
  projectId: string;
  role: Role;
  balance: TokenBalance;
  onRetire: () => void;
}

const canRetire = (role: Role): boolean => {
  return role === "SUPER_ADMIN";
};

export const RetireTokenForm: React.FC<RetireTokenFormProps> = ({
  role,
  balance,
  onRetire,
}) => {
  const [isRetiring, setIsRetiring] = useState(false);

  const circulatingSupply = balance.circulating + balance.locked + balance.escrowed;
  const canDestroy = circulatingSupply === 0;

  const preChecks = [
    {
      label: "All tokens burned or clawed back",
      passed: circulatingSupply === 0,
      value: `${circulatingSupply.toLocaleString()} remaining`,
    },
    {
      label: "No tokens in escrow",
      passed: balance.escrowed === 0,
      value: `${balance.escrowed.toLocaleString()} in escrow`,
    },
    {
      label: "No locked tokens",
      passed: balance.locked === 0,
      value: `${balance.locked.toLocaleString()} locked`,
    },
  ];

  const handleRetire = async () => {
    setIsRetiring(true);
    try {
      onRetire();
      toast.success("Token issuance destroyed", {
        description: "The token has been permanently retired from the ledger",
      });
    } finally {
      setIsRetiring(false);
    }
  };

  if (!canRetire(role)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">
          Only Super Admins can retire token issuances
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-destructive">
            Permanent Action Warning
          </h4>
          <p className="text-xs text-destructive/80 mt-1">
            Retiring a token issuance is <strong>permanent and irreversible</strong>. 
            Once destroyed, the MPT Issuance ID cannot be reused, and no new tokens 
            can ever be created under this issuance.
          </p>
        </div>
      </div>

      {/* Pre-checks */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-foreground">
          Pre-Destruction Checks
        </h4>
        <div className="space-y-2">
          {preChecks.map((check, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                check.passed
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <div className="flex items-center gap-2">
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
                <span className="text-xs text-foreground">{check.label}</span>
              </div>
              <span
                className={`text-xs ${
                  check.passed ? "text-green-600" : "text-destructive"
                }`}
              >
                {check.passed ? "Passed" : check.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Destroy Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={!canDestroy || isRetiring}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {canDestroy
              ? "Destroy Token Issuance"
              : "Cannot Destroy - Tokens Still Exist"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Permanently Destroy Token?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will trigger an <code className="text-xs">MPTokenIssuanceDestroy</code> transaction 
              on the XRPL. This is <strong>permanent</strong> and cannot be undone.
              <br /><br />
              The token issuance will be removed from the ledger forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRetire}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Destroy Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!canDestroy && (
        <p className="text-[10px] text-muted-foreground text-center">
          You must clawback or burn all tokens before destroying the issuance
        </p>
      )}
    </div>
  );
};
