import React from "react";
import { Investor, InvestorWallet, getApprovalLevel } from "@/types/investor";
import {
  KycStatusBadge,
  AccreditationBadge,
  ApprovalLevelBadge,
} from "./InvestorStatusBadges";
import { Calendar, Mail, Phone, MapPin, Wallet, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const approvalLevel = getApprovalLevel(investor, wallets);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
      {/* Header with name and overall status */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {investor.fullName}
            </h3>
            <ApprovalLevelBadge level={approvalLevel} />
          </div>

          {/* Contact Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground group">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>{investor.email}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100"
                onClick={() => copyToClipboard(investor.email, "Email")}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100"
                onClick={() => window.open(`mailto:${investor.email}`)}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground group">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{investor.phone}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100"
                onClick={() => copyToClipboard(investor.phone, "Phone")}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100"
                onClick={() => window.open(`tel:${investor.phone.replace(/\D/g, "")}`)}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{investor.jurisdiction}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>
                Joined {new Date(investor.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="flex flex-col items-end gap-3">
          <div className="space-y-2 text-right">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                KYC Status
              </p>
              <KycStatusBadge status={investor.kycStatus} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Accreditation
              </p>
              <AccreditationBadge status={investor.accreditationStatus} />
            </div>
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

      {/* Eligibility explanation */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs">
          <div className="text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground mb-1">
              Trading Eligibility
            </p>
            <p>
              This investor {approvalLevel === "FULLY_APPROVED" ? "can" : "cannot"} trade. 
              Requirements: KYC must be <strong>Approved</strong> and at least one wallet 
              must have <strong>PermissionDEX Approved</strong> status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
