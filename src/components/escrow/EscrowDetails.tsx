import React from "react";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Copy, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Escrow, escrowStatusLabel, escrowAssetTypeLabel, escrowConditionLabel, escrowPermissions } from "@/types/escrow";
import { Role } from "@/types/tokenization";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EscrowTimeline } from "./EscrowTimeline";
import { ExplorerLinkBadge } from "@/components/tokens/ExplorerLinkBadge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EscrowDetailsProps {
  escrow: Escrow;
  role: Role;
  onBack: () => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",
  EXPIRED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export const EscrowDetails: React.FC<EscrowDetailsProps> = ({ escrow, role, onBack }) => {
  const canComplete = escrowPermissions.completeEscrow.includes(role) && escrow.status === "ACTIVE";
  const canCancel = escrowPermissions.cancelEscrow.includes(role) && escrow.status === "ACTIVE";

  const handleComplete = () => {
    toast({
      title: "Escrow Completed",
      description: "The escrow has been released to the destination.",
    });
  };

  const handleCancel = () => {
    toast({
      title: "Escrow Cancelled",
      description: "The escrow has been cancelled and funds returned to sender.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                Escrow #{escrow.escrowSequence || escrow.id.slice(-6)}
              </h1>
              <Badge variant="outline" className={cn(statusColors[escrow.status])}>
                {escrowStatusLabel[escrow.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {format(new Date(escrow.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canComplete && (
            <Button onClick={handleComplete} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Complete Escrow
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive" onClick={handleCancel} className="gap-2">
              <XCircle className="w-4 h-4" />
              Cancel Escrow
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <EscrowTimeline escrow={escrow} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asset Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Asset Type" value={escrowAssetTypeLabel[escrow.assetType]} />
            {escrow.tokenSymbol && <DetailRow label="Token" value={escrow.tokenSymbol} />}
            {escrow.currencyCode && <DetailRow label="Currency" value={escrow.currencyCode} />}
            <DetailRow
              label="Amount"
              value={
                <span>
                  <span className="font-semibold">{escrow.amount.toLocaleString()}</span>
                  {escrow.amountUsd && (
                    <span className="text-muted-foreground ml-2">
                      (${escrow.amountUsd.toLocaleString()} USD)
                    </span>
                  )}
                </span>
              }
            />
            <DetailRow label="Network" value={escrow.network.toUpperCase()} />
          </CardContent>
        </Card>

        {/* Parties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sender</p>
              <p className="font-medium">{escrow.senderName || "Unknown"}</p>
              <ExplorerLinkBadge
                type="address"
                value={escrow.senderAddress}
                network={escrow.network}
              />
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Destination</p>
              <p className="font-medium">{escrow.destinationName || "Unknown"}</p>
              <ExplorerLinkBadge
                type="address"
                value={escrow.destinationAddress}
                network={escrow.network}
              />
            </div>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Condition Type" value={escrowConditionLabel[escrow.conditionType]} />
            {escrow.finishAfter && (
              <DetailRow
                label="Unlock After"
                value={format(new Date(escrow.finishAfter), "MMM d, yyyy 'at' h:mm a")}
              />
            )}
            {escrow.cancelAfter && (
              <DetailRow
                label="Expires After"
                value={format(new Date(escrow.cancelAfter), "MMM d, yyyy 'at' h:mm a")}
              />
            )}
            {escrow.cryptoCondition && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Crypto Condition</p>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
                  {escrow.cryptoCondition}
                </code>
              </div>
            )}
            {escrow.oracleEndpoint && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Oracle Endpoint</p>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
                  {escrow.oracleEndpoint}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {escrow.createTxHash && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Creation TX</p>
                <ExplorerLinkBadge
                  type="tx"
                  value={escrow.createTxHash}
                  network={escrow.network}
                />
              </div>
            )}
            {escrow.finishTxHash && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Completion TX</p>
                <ExplorerLinkBadge
                  type="tx"
                  value={escrow.finishTxHash}
                  network={escrow.network}
                />
              </div>
            )}
            {escrow.cancelTxHash && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cancellation TX</p>
                <ExplorerLinkBadge
                  type="tx"
                  value={escrow.cancelTxHash}
                  network={escrow.network}
                />
              </div>
            )}
            {!escrow.createTxHash && !escrow.finishTxHash && !escrow.cancelTxHash && (
              <p className="text-sm text-muted-foreground">No transaction records available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);
