import React from "react";
import { IssuingWallet, walletPermissionLabel } from "@/types/token";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Wallet, CheckCircle, XCircle, Clock, AlertTriangle, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Step2WalletConfigProps {
  wallets: IssuingWallet[];
  selected?: IssuingWallet;
  onSelect: (wallet: IssuingWallet) => void;
}

export const Step2WalletConfig: React.FC<Step2WalletConfigProps> = ({
  wallets,
  selected,
  onSelect,
}) => {
  const getStatusIcon = (wallet: IssuingWallet) => {
    if (wallet.permissionDexStatus === "APPROVED" && wallet.isAuthorized) {
      return <CheckCircle className="h-5 w-5 text-emerald-400" />;
    }
    if (wallet.permissionDexStatus === "PENDING") {
      return <Clock className="h-5 w-5 text-amber-400" />;
    }
    return <XCircle className="h-5 w-5 text-rose-400" />;
  };

  const isBlocked = (wallet: IssuingWallet) => {
    return !wallet.isAuthorized || wallet.permissionDexStatus !== "APPROVED";
  };

  const getBlockingReason = (wallet: IssuingWallet) => {
    if (!wallet.isAuthorized) return "Wallet not authorized";
    if (wallet.permissionDexStatus === "PENDING") return "PermissionDEX pending";
    if (wallet.permissionDexStatus === "REJECTED") return "PermissionDEX rejected";
    if (wallet.permissionDexStatus === "NOT_LINKED") return "PermissionDEX not linked";
    return null;
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Select Issuing Wallet</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the custody-controlled wallet that will issue this token
        </p>
      </div>

      {selected && isBlocked(selected) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cannot proceed</AlertTitle>
          <AlertDescription>
            {getBlockingReason(selected)}. Please select an authorized wallet with PermissionDEX approval.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {wallets.map((wallet) => (
          <Card
            key={wallet.id}
            className={cn(
              "cursor-pointer transition-all",
              selected?.id === wallet.id
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : isBlocked(wallet)
                ? "bg-muted/30 border-border opacity-60"
                : "bg-card border-border hover:border-primary/50"
            )}
            onClick={() => onSelect(wallet)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg",
                      isBlocked(wallet) ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                    )}
                  >
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{wallet.name}</h3>
                    <code className="text-xs text-muted-foreground">
                      {wallet.xrplAddress}
                    </code>
                  </div>
                </div>
                {getStatusIcon(wallet)}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {/* Multi-sign status */}
                <div className="flex items-center gap-1.5 text-xs">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  {wallet.multiSignEnabled ? (
                    <span className="text-foreground">
                      Multi-sig {wallet.multiSignQuorum}/{wallet.multiSignSigners}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Single signature</span>
                  )}
                </div>

                {/* PermissionDEX status */}
                <div
                  className={cn(
                    "text-xs px-2 py-0.5 rounded",
                    wallet.permissionDexStatus === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : wallet.permissionDexStatus === "PENDING"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-rose-500/10 text-rose-400"
                  )}
                >
                  PDX: {walletPermissionLabel[wallet.permissionDexStatus]}
                </div>

                {/* Authorization status */}
                <div
                  className={cn(
                    "text-xs px-2 py-0.5 rounded",
                    wallet.isAuthorized ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  )}
                >
                  {wallet.isAuthorized ? "Authorized" : "Not Authorized"}
                </div>
              </div>

              {isBlocked(wallet) && (
                <p className="mt-3 text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {getBlockingReason(wallet)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
