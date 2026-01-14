import React, { useState } from "react";
import { format } from "date-fns";
import { Shield, Wallet, CheckCircle2, Clock, XCircle, Users, Server, Coins, Pencil, Tag, AlertTriangle } from "lucide-react";
import { IssuingWallet, walletPermissionLabel, walletRoleLabel, walletStatusLabel, riskTierLabel } from "@/types/token";
import { MultiSignConfig } from "@/types/multiSign";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExplorerLinkBadge } from "@/components/tokens/ExplorerLinkBadge";
import { EditWalletDialog } from "./EditWalletDialog";
import { KeyStorageTypeBadge } from "@/components/custody/KeyStorageTypeBadge";
import { cn } from "@/lib/utils";
import { requiresMigration } from "@/types/custody";

interface WalletCardProps {
  wallet: IssuingWallet;
  config?: MultiSignConfig;
  onSelect: () => void;
  isSelected: boolean;
  onRefresh?: () => void;
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
  CUSTODY: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  SETTLEMENT: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  BRIDGE: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  ORACLE: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  COMPLIANCE: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  COLD_STORAGE: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  HOT_WALLET: "bg-red-500/10 text-red-600 border-red-500/20",
};

const riskColors: Record<string, string> = {
  LOW: "text-green-600",
  MEDIUM: "text-amber-600",
  HIGH: "text-orange-600",
  CRITICAL: "text-red-600",
};

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, config, onSelect, isSelected, onRefresh }) => {
  const [editOpen, setEditOpen] = useState(false);
  const StatusIcon = permissionStatusIcons[wallet.permissionDexStatus];

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditOpen(true);
  };

  return (
    <>
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
                  <Badge variant="outline" className={cn("text-[10px]", roleColors[wallet.role] || roleColors.OPS)}>
                    {walletRoleLabel[wallet.role] || wallet.role}
                  </Badge>
                  {wallet.multiSignEnabled && (
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                      Multi-Sig
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn("text-[10px]", walletStatusColors[wallet.status])}>
                    {walletStatusLabel[wallet.status]}
                  </Badge>
                  <KeyStorageTypeBadge type={wallet.keyStorageType} size="sm" />
                  {wallet.riskTier && wallet.riskTier !== "MEDIUM" && (
                    <Badge variant="outline" className={cn("text-[10px]", riskColors[wallet.riskTier])}>
                      {riskTierLabel[wallet.riskTier]}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {wallet.balance !== undefined && wallet.balance > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    {wallet.balance.toLocaleString()} XRP
                  </div>
                </div>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditClick}>
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          {wallet.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{wallet.description}</p>
          )}

          {/* Tags */}
          {wallet.tags && wallet.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3 h-3 text-muted-foreground" />
              {wallet.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
              {wallet.tags.length > 4 && (
                <span className="text-xs text-muted-foreground">+{wallet.tags.length - 4} more</span>
              )}
            </div>
          )}

          {/* Address & Network */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Address</p>
              <ExplorerLinkBadge type="address" value={wallet.xrplAddress} network={wallet.network} />
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

          {/* Legacy Wallet Warning */}
          {requiresMigration(wallet.keyStorageType) && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-700">Migration Required</p>
                  <p className="text-xs text-amber-600/80 mt-0.5">
                    This wallet uses legacy database key storage. Migrate to vault-backed storage for enhanced security.
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
            <span>
              Created by {wallet.createdByName || "System"} on {format(new Date(wallet.createdAt), "MMM d, yyyy")}
            </span>
            {wallet.lastSyncedAt && (
              <span>Synced {format(new Date(wallet.lastSyncedAt), "MMM d, h:mm a")}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <EditWalletDialog
        wallet={wallet}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => onRefresh?.()}
      />
    </>
  );
};
