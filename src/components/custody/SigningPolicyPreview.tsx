import React from "react";
import { Shield, AlertCircle, Users, Clock, Coins, CheckCircle2 } from "lucide-react";
import { WalletRole, XRPLNetwork } from "@/types/token";
import { BatchableTxType, batchableTxTypeLabels } from "@/types/batchTransaction";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SigningPolicyPreviewProps {
  walletRole: WalletRole;
  network: XRPLNetwork;
  txType: BatchableTxType;
  amount?: number;
  compact?: boolean;
}

// Mock policy lookup - In production, fetch from signing_policies table
function getPolicyForContext(
  walletRole: WalletRole,
  network: XRPLNetwork,
  txType: BatchableTxType
) {
  // Default policies based on role and network
  const isTestnet = network === "testnet" || network === "devnet";
  
  const policies: Record<string, {
    name: string;
    maxAmountXrp: number;
    requiresMultiSign: boolean;
    minSigners: number;
    rateLimitPerMinute: number;
  }> = {
    ISSUER: {
      name: isTestnet ? "Issuer Testnet Policy" : "Issuer Production Policy",
      maxAmountXrp: isTestnet ? 100_000 : 10_000,
      requiresMultiSign: !isTestnet,
      minSigners: isTestnet ? 1 : 2,
      rateLimitPerMinute: 10,
    },
    TREASURY: {
      name: isTestnet ? "Treasury Testnet Policy" : "Treasury Production Policy",
      maxAmountXrp: isTestnet ? 500_000 : 50_000,
      requiresMultiSign: true,
      minSigners: isTestnet ? 2 : 3,
      rateLimitPerMinute: 5,
    },
    OPS: {
      name: "Operations Policy",
      maxAmountXrp: isTestnet ? 10_000 : 1_000,
      requiresMultiSign: false,
      minSigners: 1,
      rateLimitPerMinute: 20,
    },
    ESCROW: {
      name: "Escrow Policy",
      maxAmountXrp: isTestnet ? 50_000 : 25_000,
      requiresMultiSign: !isTestnet,
      minSigners: isTestnet ? 1 : 2,
      rateLimitPerMinute: 10,
    },
    TEST: {
      name: "Test Wallet Policy",
      maxAmountXrp: 1_000,
      requiresMultiSign: false,
      minSigners: 1,
      rateLimitPerMinute: 100,
    },
  };

  return policies[walletRole] || policies.OPS;
}

export const SigningPolicyPreview: React.FC<SigningPolicyPreviewProps> = ({
  walletRole,
  network,
  txType,
  amount,
  compact = false,
}) => {
  const policy = getPolicyForContext(walletRole, network, txType);
  const amountUsage = amount ? (amount / policy.maxAmountXrp) * 100 : 0;
  const isOverLimit = amountUsage > 100;
  const isNearLimit = amountUsage > 80 && !isOverLimit;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Shield className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">{policy.name}</span>
        {policy.requiresMultiSign && (
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            <Users className="h-2.5 w-2.5 mr-0.5" />
            {policy.minSigners}
          </Badge>
        )}
        {isOverLimit && (
          <Badge variant="destructive" className="text-[10px] h-4 px-1">
            Over limit
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{policy.name}</span>
        </div>
        <Badge variant="outline" className="text-xs capitalize">
          {network}
        </Badge>
      </div>

      {/* Transaction Type */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Transaction Type</span>
        <Badge variant="secondary">{batchableTxTypeLabels[txType]}</Badge>
      </div>

      {/* Amount Limit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Amount Limit</span>
          <span className={cn(
            "font-medium",
            isOverLimit && "text-destructive",
            isNearLimit && "text-amber-600"
          )}>
            {amount?.toLocaleString() || 0} / {policy.maxAmountXrp.toLocaleString()} XRP
          </span>
        </div>
        <Progress 
          value={Math.min(amountUsage, 100)} 
          className={cn(
            "h-2",
            isOverLimit && "[&>div]:bg-destructive",
            isNearLimit && "[&>div]:bg-amber-500"
          )}
        />
        {isOverLimit && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            Amount exceeds policy limit
          </div>
        )}
      </div>

      {/* Multi-Sign Requirement */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Multi-Signature</span>
        {policy.requiresMultiSign ? (
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-purple-600" />
            <span className="font-medium">{policy.minSigners} signers required</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-medium">Single signature</span>
          </div>
        )}
      </div>

      {/* Rate Limit */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Rate Limit</span>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{policy.rateLimitPerMinute}/min</span>
        </div>
      </div>

      {/* Warnings */}
      {policy.requiresMultiSign && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-md p-2.5">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-purple-600 mt-0.5" />
            <p className="text-xs text-purple-700">
              This transaction will be queued for multi-signature approval.
              {policy.minSigners} authorized signers must approve before execution.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
