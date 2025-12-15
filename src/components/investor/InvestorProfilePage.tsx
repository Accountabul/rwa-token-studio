import React from "react";
import { Investor, InvestorWallet, InvestorApplication, InvestorHolding, AuditLogEntry, kycStatusLabel, accreditationLabel } from "@/types/investor";
import { InvestorSummaryHeader } from "./InvestorSummaryHeader";
import { WalletSection } from "./WalletSection";
import { ApplicationsSection } from "./ApplicationsSection";
import { PlatformHoldingsSection } from "./PlatformHoldingsSection";
import { AuditLogSection } from "./AuditLogSection";
import { Mail, Phone, Calendar, UserCheck, Shield, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface InvestorProfilePageProps {
  investor: Investor;
  wallets: InvestorWallet[];
  applications: InvestorApplication[];
  holdings: InvestorHolding[];
  auditLog: AuditLogEntry[];
  onSyncWallet: (walletId: string) => void;
  onBack: () => void;
}

export const InvestorProfilePage: React.FC<InvestorProfilePageProps> = ({
  investor,
  wallets,
  applications,
  holdings,
  auditLog,
  onSyncWallet,
  onBack,
}) => {
  const lastActivity = auditLog.length > 0
    ? auditLog.reduce((latest, entry) => 
        new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest
      ).timestamp
    : investor.createdAt;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const kycStatusConfig = {
    PENDING: { className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    APPROVED: { className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    REJECTED: { className: "bg-red-500/10 text-red-600 border-red-500/20" },
  };

  const accreditationConfig = {
    ACCREDITED: { className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    NON_ACCREDITED: { className: "bg-muted text-muted-foreground border-border" },
    N_A: { className: "bg-muted text-muted-foreground border-border" },
  };

  return (
    <div className="flex flex-col h-full">
      <InvestorSummaryHeader
        investor={investor}
        wallets={wallets}
        lastActivity={lastActivity}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Identity & Signup Information */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">Identity & Signup Information</h4>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">KYC Status</span>
                </div>
                <Badge variant="outline" className={kycStatusConfig[investor.kycStatus].className}>
                  {kycStatusLabel[investor.kycStatus]}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Accreditation</span>
                </div>
                <Badge variant="outline" className={accreditationConfig[investor.accreditationStatus].className}>
                  {accreditationLabel[investor.accreditationStatus]}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Signup Date</span>
                </div>
                <span className="text-sm font-medium text-foreground">{formatDate(investor.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{investor.email}</span>
                </div>
                <button onClick={() => copyToClipboard(investor.email, "Email")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{investor.phone}</span>
                </div>
                <button onClick={() => copyToClipboard(investor.phone, "Phone")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-sm text-muted-foreground">Signup Method</span>
                <Badge variant="outline" className="text-[11px]">Invite Link</Badge>
              </div>
            </div>
          </div>
        </div>

        <WalletSection wallets={wallets} onSyncWallet={onSyncWallet} />
        <PlatformHoldingsSection holdings={holdings} wallets={wallets} />
        <ApplicationsSection investor={investor} applications={applications} wallets={wallets} />
        <AuditLogSection entries={auditLog} />
      </div>
    </div>
  );
};
