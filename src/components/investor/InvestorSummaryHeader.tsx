import React from "react";
import { Investor, InvestorWallet, getApprovalLevel, approvalLevelLabel } from "@/types/investor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Clock, Hash, CheckCircle2, AlertCircle, XCircle, Copy } from "lucide-react";
import { toast } from "sonner";

interface InvestorSummaryHeaderProps {
  investor: Investor;
  wallets: InvestorWallet[];
  lastActivity?: string;
  onBack: () => void;
}

export const InvestorSummaryHeader: React.FC<InvestorSummaryHeaderProps> = ({
  investor,
  wallets,
  lastActivity,
  onBack,
}) => {
  const approvalLevel = getApprovalLevel(investor, wallets);

  const copyId = () => {
    navigator.clipboard.writeText(investor.id);
    toast.success("Investor ID copied");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  const eligibilityConfig = {
    FULLY_APPROVED: {
      icon: CheckCircle2,
      label: "Fully Eligible",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    PARTIALLY_APPROVED: {
      icon: AlertCircle,
      label: "Partially Eligible",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    NOT_APPROVED: {
      icon: XCircle,
      label: "Not Eligible",
      className: "bg-red-500/10 text-red-600 border-red-500/20",
    },
  };

  const config = eligibilityConfig[approvalLevel];
  const Icon = config.icon;

  return (
    <div className="bg-card border-b border-border px-6 py-5">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Investors
      </Button>

      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {investor.fullName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {investor.fullName}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {investor.jurisdiction}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {formatDate(investor.createdAt)}
                </span>
                {lastActivity && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatRelativeTime(lastActivity)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className={config.className}>
              <Icon className="w-3.5 h-3.5 mr-1" />
              {config.label}
            </Badge>
            <button
              onClick={copyId}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Hash className="w-3 h-3" />
              {investor.id}
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Request Info
          </Button>
          {investor.kycStatus === "PENDING" && (
            <>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                Reject
              </Button>
              <Button size="sm">Approve KYC</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
