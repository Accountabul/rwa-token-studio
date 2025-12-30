import React from "react";
import { format } from "date-fns";
import { Shield, Wallet, CheckCircle2, Clock, XCircle, Users, Server, Coins } from "lucide-react";
import { IssuingWallet, walletPermissionLabel, walletRoleLabel, walletStatusLabel } from "@/types/token";
import { MultiSignConfig } from "@/types/multiSign";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExplorerLinkBadge } from "@/components/tokens/ExplorerLinkBadge";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  wallet: IssuingWallet;
  config?: MultiSignConfig;
  onSelect: () => void;
  isSelected: boolean;
}

const permissionStatusColors: Record<string, string> = {
  APPROVED: "bg-green-500/10 text-green-600 border-green-500/20",
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
  NOT_LINKED: "bg-muted text-muted-foreground border-border",
};

const permissionStatusIcons: Record<string, React.ElementType> = {
  APPROVED: CheckCircle2,
  PENDING: Clock,
  REJECTED: XCircle,
  NOT_LINKED: Wallet,
};

const walletStatusColors: Record<string, string> = {
  PROVISIONING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  SUSPENDED: "bg-red-500/10 text-red-600 border-red-500/20",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
};

const roleColors: Record<string, string> = {
  ISSUER: "bg-primary/10 text-primary border-primary/20",
  TREASURY: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  ESCROW: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  OPS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  TEST: "bg-muted text-muted-foreground border-border",
};

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, config, onSelect, isSelected }) => {
  const StatusIcon = permissionStatusIcons[wallet.permissionDexStatus];

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-primary/50",
        isSelected && "border-primary ring-2 ring-primary/20"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              wallet.multiSignEnabled ? "bg-purple-500/10" : "bg-muted"
            )}>
              {wallet.multiSignEnabled ? (
                <Shield className="w-5 h-5 text-purple-600" />
              ) : (
                <Wallet className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{wallet.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {/* Role Badge */}
                <Badge variant="outline" className={cn("text-[10px]", roleColors[wallet.role])}>
                  {walletRoleLabel[wallet.role]}
                </Badge>
                {/* Multi-Sig Badge */}
                {wallet.multiSignEnabled && (
                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                    Multi-Sig
                  </Badge>
                )}
                {/* Status Badge */}
                <Badge variant="outline" className={cn("text-[10px]", walletStatusColors[wallet.status])}>
                  {walletStatusLabel[wallet.status]}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Balance */}
          {wallet.balance !== undefined && wallet.balance > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                {wallet.balance.toLocaleString()} XRP
              </div>
            </div>
          )}
        </div>

        {/* Address & Network */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Address</p>
            <ExplorerLinkBadge
              type="address"
              value={wallet.xrplAddress}
              network={wallet.network}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Network</p>
            <Badge variant="outline" className="text-[10px] capitalize">
              <Server className="w-3 h-3 mr-1" />
              {wallet.network}
            </Badge>
          </div>
        </div>

        {/* PermissionDEX Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">PermissionDEX:</span>
            <Badge variant="outline" className={cn("text-[10px]", permissionStatusColors[wallet.permissionDexStatus])}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {walletPermissionLabel[wallet.permissionDexStatus]}
            </Badge>
          </div>
        </div>

        {/* Multi-Sig Info */}
        {wallet.multiSignEnabled && config && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {config.quorum} of {config.signers.length} signatures required
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {config.signers.map((signer) => (
                <Badge key={signer.id} variant="secondary" className="text-[10px]">
                  {signer.name} (w:{signer.weight})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Footer - Created by & Last Sync */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
          <span>
            Created by {wallet.createdByName || "System"} on{" "}
            {format(new Date(wallet.createdAt), "MMM d, yyyy")}
          </span>
          {wallet.lastSyncedAt && (
            <span>
              Synced {format(new Date(wallet.lastSyncedAt), "MMM d, h:mm a")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
