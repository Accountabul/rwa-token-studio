import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TokenDistribution, TokenBalance, AuthorizedHolder } from "@/types/mptTransactions";
import { Role } from "@/types/tokenization";
import { Send, Coins, TrendingUp, Lock, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DistributeTokensFormProps {
  projectId: string;
  role: Role;
  balance: TokenBalance;
  authorizedHolders: AuthorizedHolder[];
  distributions: TokenDistribution[];
  onDistribute: (destination: string, amount: number, memo?: string) => void;
}

const canDistribute = (role: Role): boolean => {
  return (
    role === "SUPER_ADMIN" ||
    role === "TOKENIZATION_MANAGER" ||
    role === "CUSTODY_OFFICER"
  );
};

export const DistributeTokensForm: React.FC<DistributeTokensFormProps> = ({
  role,
  balance,
  authorizedHolders,
  distributions,
  onDistribute,
}) => {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeHolders = authorizedHolders.filter((h) => h.status === "AUTHORIZED");
  const availableToDistribute = balance.totalIssued - balance.circulating - balance.locked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!destination) {
      toast.error("Please select a destination address");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (numAmount > availableToDistribute) {
      toast.error("Amount exceeds available balance");
      return;
    }

    setIsSubmitting(true);
    try {
      onDistribute(destination, numAmount, memo.trim() || undefined);
      setDestination("");
      setAmount("");
      setMemo("");
      toast.success("Tokens distributed successfully", {
        description: `${numAmount.toLocaleString()} tokens sent to ${destination.slice(0, 8)}...`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canDistribute(role)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Coins className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">
          Only Tokenization Managers, Custody Officers, and Super Admins can distribute tokens
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground">Total Issued</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {balance.totalIssued.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground">Circulating</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {balance.circulating.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Locked</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {balance.locked.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground">Available</span>
          </div>
          <p className="text-sm font-semibold text-primary">
            {availableToDistribute.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Distribution Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="destination" className="text-xs font-medium">
            Destination Address
          </Label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger className="text-xs font-mono">
              <SelectValue placeholder="Select authorized holder..." />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {activeHolders.map((holder) => (
                <SelectItem
                  key={holder.id}
                  value={holder.address}
                  className="text-xs font-mono"
                >
                  {holder.address.slice(0, 12)}...{holder.address.slice(-8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeHolders.length === 0 && (
            <p className="text-[10px] text-amber-600">
              No authorized holders. Authorize holders first before distributing tokens.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="text-xs font-medium">
            Amount
          </Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={availableToDistribute}
              className="text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAmount(availableToDistribute.toString())}
            >
              Max
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="memo" className="text-xs font-medium">
            Memo (Optional)
          </Label>
          <Textarea
            id="memo"
            placeholder="Add a memo to this transaction..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="text-xs min-h-[60px]"
            maxLength={200}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !destination || !amount || activeHolders.length === 0}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          Distribute Tokens
        </Button>
      </form>

      {/* Recent Distributions */}
      {distributions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-foreground">
            Recent Distributions
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {distributions.slice(0, 5).map((dist) => (
              <div
                key={dist.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div>
                  <code className="text-xs font-mono text-foreground">
                    {dist.destination.slice(0, 10)}...{dist.destination.slice(-6)}
                  </code>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {dist.timestamp}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  +{dist.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
