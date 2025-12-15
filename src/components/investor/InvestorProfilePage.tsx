import React from "react";
import {
  Investor,
  InvestorWallet,
  InvestorApplication,
  getApprovalLevel,
  canParticipate,
  kycStatusLabel,
  accreditationLabel,
} from "@/types/investor";
import { WalletSection } from "./WalletSection";
import { ApplicationsSection } from "./ApplicationsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Copy,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  History,
} from "lucide-react";
import { toast } from "sonner";

interface InvestorProfilePageProps {
  investor: Investor;
  wallets: InvestorWallet[];
  applications: InvestorApplication[];
  onSyncWallet: (walletId: string) => void;
  onBack: () => void;
}

export const InvestorProfilePage: React.FC<InvestorProfilePageProps> = ({
  investor,
  wallets,
  applications,
  onSyncWallet,
  onBack,
}) => {
  const approvedWallet = wallets.find((w) => w.permissionDexStatus === "APPROVED");
  const isEligible = approvedWallet ? canParticipate(investor, approvedWallet) : false;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEligibilityBadge = () => {
    if (isEligible) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Fully Approved
        </Badge>
      );
    }
    if (investor.kycStatus === "APPROVED") {
      return (
        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-500/30">
          <Clock className="w-3 h-3" />
          Wallet Pending
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <XCircle className="w-3 h-3" />
        Not Eligible
      </Badge>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Investors
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {investor.fullName}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {getEligibilityBadge()}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {investor.jurisdiction}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {formatDate(investor.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Request Info
              </Button>
              {investor.kycStatus === "PENDING" && (
                <Button size="sm">Approve KYC</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Identity & Compliance Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Identity & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    KYC Status
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    {investor.kycStatus === "APPROVED" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : investor.kycStatus === "REJECTED" ? (
                      <XCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="font-medium">
                      {kycStatusLabel[investor.kycStatus]}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Accreditation
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {accreditationLabel[investor.accreditationStatus]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Email
                  </label>
                  <div className="mt-1 flex items-center gap-2 group">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{investor.email}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(investor.email, "Email")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Phone
                  </label>
                  <div className="mt-1 flex items-center gap-2 group">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{investor.phone}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(investor.phone, "Phone")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-column layout for Wallets and Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WalletSection wallets={wallets} onSyncWallet={onSyncWallet} />
          <ApplicationsSection
            investor={investor}
            applications={applications}
            wallets={wallets}
          />
        </div>

        {/* Activity Log Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <div>
                  <p className="font-medium">Investor profile created</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(investor.createdAt)}
                  </p>
                </div>
              </div>
              {wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5" />
                  <div>
                    <p className="font-medium">
                      Wallet linked: {wallet.xrplAddress.slice(0, 8)}...
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Status: {wallet.permissionDexStatus}
                    </p>
                  </div>
                </div>
              ))}
              {applications.map((app) => (
                <div key={app.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5" />
                  <div>
                    <p className="font-medium">
                      Applied to {app.projectName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(app.createdAt)} • Status: {app.status}
                    </p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground italic pt-2">
                Full audit trail coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
