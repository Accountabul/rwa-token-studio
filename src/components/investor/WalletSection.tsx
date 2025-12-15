import React from "react";
import { InvestorWallet } from "@/types/investor";
import { PermissionDexBadge } from "./InvestorStatusBadges";
import { WalletValuePanel } from "./WalletValuePanel";
import { RefreshCw, Wallet, CheckCircle2, XCircle, Clock, Unlink, Shield, ShieldOff, History, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface WalletSectionProps {
  wallets: InvestorWallet[];
  onSyncWallet: (walletId: string) => void;
}

const statusOrder: Record<InvestorWallet["permissionDexStatus"], number> = {
  APPROVED: 0,
  PENDING: 1,
  REJECTED: 2,
  NOT_LINKED: 3,
};

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
  // Sort wallets: APPROVED → PENDING → REJECTED → NOT_LINKED
  const sortedWallets = [...wallets].sort(
    (a, b) => statusOrder[a.permissionDexStatus] - statusOrder[b.permissionDexStatus]
  );

  const handleSync = (wallet: InvestorWallet) => {
    onSyncWallet(wallet.id);
    toast.info("Syncing PermissionDEX status...", {
      description: `Wallet: ${wallet.xrplAddress.slice(0, 8)}...${wallet.xrplAddress.slice(-6)}`,
    });
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Wallet address copied");
  };

  const handleRevoke = (wallet: InvestorWallet) => {
    toast.info("Revoke wallet access", {
      description: `This would revoke access for ${wallet.xrplAddress.slice(0, 8)}...`,
    });
  };

  const handleDepermission = (wallet: InvestorWallet) => {
    toast.info("De-permission wallet", {
      description: `This would remove DEX permission for ${wallet.xrplAddress.slice(0, 8)}...`,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
        <div className="space-y-4">
          {sortedWallets.map((wallet) => (
            <div
              key={wallet.id}
              className="p-4 rounded-lg bg-muted/30 border border-border/50"
            >
              {/* Wallet Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {statusIcon[wallet.permissionDexStatus]}
                  <div>
                    <div className="flex items-center gap-2">
                      {wallet.permissionDexStatus === "APPROVED" && (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          DEX APPROVED
                        </Badge>
                      )}
                      {wallet.network && (
                        <Badge variant="outline" className="text-[10px]">
                          {wallet.network}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs font-mono text-foreground">
                        {wallet.xrplAddress}
                      </code>
                      <button
                        onClick={() => handleCopyAddress(wallet.xrplAddress)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <PermissionDexBadge status={wallet.permissionDexStatus} />
              </div>

              {/* Wallet Meta */}
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                <span>Added: {formatDate(wallet.createdAt)}</span>
                {wallet.lastSyncAt ? (
                  <span>Last sync: {formatDate(wallet.lastSyncAt)}</span>
                ) : (
                  <span className="text-amber-500">Never synced</span>
                )}
              </div>

              {/* Wallet Value Panel (only for approved wallets with value) */}
              <WalletValuePanel wallet={wallet} />

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync(wallet)}
                  className="text-xs gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sync
                </Button>
                {wallet.permissionDexStatus === "APPROVED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDepermission(wallet)}
                    className="text-xs gap-1.5 text-amber-600 hover:text-amber-700"
                  >
                    <ShieldOff className="w-3 h-3" />
                    De-permission
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(wallet)}
                  className="text-xs gap-1.5 text-red-600 hover:text-red-700"
                >
                  <XCircle className="w-3 h-3" />
                  Revoke
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5 ml-auto"
                >
                  <History className="w-3 h-3" />
                  History
                </Button>
              </div>
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
