import React from "react";
import { InvestorWallet } from "@/types/investor";
import { PermissionDexBadge } from "./InvestorStatusBadges";
import { RefreshCw, Wallet, CheckCircle2, XCircle, Clock, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WalletSectionProps {
  wallets: InvestorWallet[];
  onSyncWallet: (walletId: string) => void;
}

const statusIcon: Record<InvestorWallet["permissionDexStatus"], React.ReactNode> = {
  APPROVED: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  PENDING: <Clock className="w-4 h-4 text-amber-500" />,
  REJECTED: <XCircle className="w-4 h-4 text-red-500" />,
  NOT_LINKED: <Unlink className="w-4 h-4 text-muted-foreground" />,
};

export const WalletSection: React.FC<WalletSectionProps> = ({
  wallets,
  onSyncWallet,
}) => {
  const handleSync = (wallet: InvestorWallet) => {
    onSyncWallet(wallet.id);
    toast.info("Syncing PermissionDEX status...", {
      description: `Wallet: ${wallet.xrplAddress.slice(0, 8)}...${wallet.xrplAddress.slice(-6)}`,
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">
            Wallet Management
          </h4>
        </div>
        <span className="text-xs text-muted-foreground">
          {wallets.length} wallet{wallets.length !== 1 && "s"}
        </span>
      </div>

      {wallets.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No wallets registered for this investor.
        </p>
      ) : (
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex items-center gap-3">
                {statusIcon[wallet.permissionDexStatus]}
                <div>
                  <code className="text-xs font-mono text-foreground">
                    {wallet.xrplAddress}
                  </code>
                  <div className="flex items-center gap-2 mt-1">
                    <PermissionDexBadge status={wallet.permissionDexStatus} />
                    {wallet.lastSyncAt && (
                      <span className="text-[10px] text-muted-foreground">
                        Last sync: {new Date(wallet.lastSyncAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync(wallet)}
                className="text-xs gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                Sync
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
        Only wallets with <strong>Approved</strong> PermissionDEX status are
        eligible for participation in tokenized offerings. Use "Sync" to refresh
        the status from PermissionDEX.
      </p>
    </div>
  );
};
