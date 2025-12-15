import React from "react";
import { format } from "date-fns";
import { Shield, Wallet, CheckCircle2, Clock, XCircle, Users } from "lucide-react";
import { IssuingWallet, walletPermissionLabel } from "@/types/token";
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

const statusColors: Record<string, string> = {
  APPROVED: "bg-green-500/10 text-green-600 border-green-500/20",
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
  NOT_LINKED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const statusIcons: Record<string, React.ElementType> = {
  APPROVED: CheckCircle2,
  PENDING: Clock,
  REJECTED: XCircle,
  NOT_LINKED: Wallet,
};

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, config, onSelect, isSelected }) => {
  const StatusIcon = statusIcons[wallet.permissionDexStatus];

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
              <div className="flex items-center gap-2 mt-1">
                {wallet.multiSignEnabled && (
                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                    Multi-Sig
                  </Badge>
                )}
                <Badge variant="outline" className={cn("text-[10px]", statusColors[wallet.permissionDexStatus])}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {walletPermissionLabel[wallet.permissionDexStatus]}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Address</p>
          <ExplorerLinkBadge
            type="address"
            address={wallet.xrplAddress}
            network="testnet"
          />
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

        {/* Last Sync */}
        {wallet.lastSyncedAt && (
          <p className="text-xs text-muted-foreground">
            Last synced: {format(new Date(wallet.lastSyncedAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
