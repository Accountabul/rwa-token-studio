import React from "react";
import { Investor, InvestorWallet } from "@/types/investor";
import { KycStatusBadge, AccreditationBadge } from "./InvestorStatusBadges";
import { Calendar, Mail, Wallet, Info } from "lucide-react";

interface InvestorSummaryCardProps {
  investor: Investor;
  wallets: InvestorWallet[];
}

export const InvestorSummaryCard: React.FC<InvestorSummaryCardProps> = ({
  investor,
  wallets,
}) => {
  const approvedWallets = wallets.filter(
    (w) => w.permissionDexStatus === "APPROVED"
  ).length;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            {investor.fullName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-3.5 h-3.5" />
            <span>{investor.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>
              Joined {new Date(investor.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <KycStatusBadge status={investor.kycStatus} />
            <AccreditationBadge status={investor.accreditationStatus} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wallet className="w-3.5 h-3.5" />
            <span>
              {wallets.length} wallet{wallets.length !== 1 && "s"} •{" "}
              {approvedWallets} approved
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground mb-1">
              Identity vs. Wallet Permissioning
            </p>
            <p>
              KYC verification applies to the <strong>investor identity</strong>.
              Each wallet must also be approved via{" "}
              <strong>PermissionDEX</strong> before it can participate in
              tokenized asset offerings. Both conditions must be met for
              eligibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
