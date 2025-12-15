import React, { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { PendingMultiSignTx, multiSignTxTypeLabel, multiSignPermissions } from "@/types/multiSign";
import { Role } from "@/types/tokenization";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SigningModal } from "./SigningModal";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MultiSignApprovalQueueProps {
  transactions: PendingMultiSignTx[];
  role: Role;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  READY: "bg-green-500/10 text-green-600 border-green-500/20",
  EXECUTED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  EXPIRED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
};

export const MultiSignApprovalQueue: React.FC<MultiSignApprovalQueueProps> = ({ transactions, role }) => {
  const [selectedTx, setSelectedTx] = useState<PendingMultiSignTx | null>(null);
  const [signingModalOpen, setSigningModalOpen] = useState(false);

  const canSign = multiSignPermissions.signTransaction.includes(role);
  const canReject = multiSignPermissions.rejectTransaction.includes(role);

  const activeTxs = transactions.filter((tx) => tx.status === "PENDING" || tx.status === "READY");
  const completedTxs = transactions.filter((tx) => tx.status === "EXECUTED" || tx.status === "EXPIRED" || tx.status === "REJECTED");

  const handleSign = (tx: PendingMultiSignTx) => {
    setSelectedTx(tx);
    setSigningModalOpen(true);
  };

  const handleExecute = (tx: PendingMultiSignTx) => {
    toast({
      title: "Transaction Executed",
      description: `${multiSignTxTypeLabel[tx.txType]} has been executed successfully.`,
    });
  };

  const handleReject = (tx: PendingMultiSignTx) => {
    toast({
      title: "Transaction Rejected",
      description: "The transaction has been rejected.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Active Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Active Transactions ({activeTxs.length})
        </h3>
        {activeTxs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No pending transactions requiring signatures.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeTxs.map((tx) => (
              <TransactionCard
                key={tx.id}
                tx={tx}
                canSign={canSign}
                canReject={canReject}
                onSign={() => handleSign(tx)}
                onExecute={() => handleExecute(tx)}
                onReject={() => handleReject(tx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Transactions */}
      {completedTxs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Completed ({completedTxs.length})
          </h3>
          <div className="space-y-4 opacity-70">
            {completedTxs.map((tx) => (
              <TransactionCard
                key={tx.id}
                tx={tx}
                canSign={false}
                canReject={false}
                onSign={() => {}}
                onExecute={() => {}}
                onReject={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Signing Modal */}
      {selectedTx && (
        <SigningModal
          open={signingModalOpen}
          onOpenChange={setSigningModalOpen}
          transaction={selectedTx}
        />
      )}
    </div>
  );
};

interface TransactionCardProps {
  tx: PendingMultiSignTx;
  canSign: boolean;
  canReject: boolean;
  onSign: () => void;
  onExecute: () => void;
  onReject: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  tx,
  canSign,
  canReject,
  onSign,
  onExecute,
  onReject,
}) => {
  const progressPercent = (tx.currentWeight / tx.requiredWeight) * 100;
  const isExpiringSoon = new Date(tx.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;
  const isActive = tx.status === "PENDING" || tx.status === "READY";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn(statusColors[tx.status])}>
                {tx.status}
              </Badge>
              <span className="font-semibold text-foreground">
                {multiSignTxTypeLabel[tx.txType]}
              </span>
              {isExpiringSoon && isActive && (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Expiring Soon
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">{tx.description}</p>

            {/* Amount */}
            {tx.amount && (
              <p className="text-sm">
                <span className="text-muted-foreground">Amount:</span>{" "}
                <span className="font-medium">{tx.amount.toLocaleString()} {tx.amountCurrency}</span>
              </p>
            )}

            {/* Signature Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Signatures</span>
                <span className="font-medium">
                  {tx.currentWeight} / {tx.requiredWeight} weight
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              {tx.signatures.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tx.signatures.map((sig) => (
                    <Badge key={sig.signerId} variant="secondary" className="text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                      {sig.signerName}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Created: {format(new Date(tx.createdAt), "MMM d, h:mm a")}</span>
              <span>
                Expires: {formatDistanceToNow(new Date(tx.expiresAt), { addSuffix: true })}
              </span>
              <span>By: {tx.createdBy}</span>
            </div>
          </div>

          {/* Actions */}
          {isActive && (
            <div className="flex flex-col gap-2">
              {tx.status === "READY" ? (
                <Button size="sm" onClick={onExecute} className="gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Execute
                </Button>
              ) : canSign ? (
                <Button size="sm" onClick={onSign} className="gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Sign
                </Button>
              ) : null}
              {canReject && (
                <Button size="sm" variant="outline" onClick={onReject} className="gap-1 text-red-600">
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
