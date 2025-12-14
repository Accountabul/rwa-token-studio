import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Investor,
  InvestorWallet,
  InvestorApplication,
  getApprovalLevel,
} from "@/types/investor";
import {
  KycStatusBadge,
  AccreditationBadge,
  ApprovalLevelIcon,
  KycStatusIcon,
  PermissionDexIcon,
  ApprovalLevelBadge,
} from "./InvestorStatusBadges";
import { Copy, Mail, Phone, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface InvestorTableProps {
  investors: Investor[];
  wallets: InvestorWallet[];
  applications: InvestorApplication[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const InvestorTable: React.FC<InvestorTableProps> = ({
  investors,
  wallets,
  applications,
  selectedId,
  onSelect,
}) => {
  const getWalletStats = (investorId: string) => {
    const investorWallets = wallets.filter((w) => w.investorId === investorId);
    const hasApproved = investorWallets.some((w) => w.permissionDexStatus === "APPROVED");
    const hasPending = investorWallets.some((w) => w.permissionDexStatus === "PENDING");
    return { total: investorWallets.length, hasApproved, hasPending };
  };

  const getApplicationStats = (investorId: string) => {
    const investorApps = applications.filter((a) => a.investorId === investorId);
    return investorApps.length;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getLastAction = (investor: Investor, investorWallets: InvestorWallet[]) => {
    const dates = [
      new Date(investor.createdAt),
      ...investorWallets
        .filter((w) => w.lastSyncAt)
        .map((w) => new Date(w.lastSyncAt!)),
    ];
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
    return latest.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[180px]">Email</TableHead>
            <TableHead className="w-[140px]">Phone</TableHead>
            <TableHead className="w-[100px]">Signup</TableHead>
            <TableHead className="w-[80px] text-center">KYC</TableHead>
            <TableHead className="w-[110px]">Accreditation</TableHead>
            <TableHead className="w-[80px] text-center">Wallet</TableHead>
            <TableHead className="w-[120px]">Approval</TableHead>
            <TableHead className="w-[80px] text-center">Apps</TableHead>
            <TableHead className="w-[90px]">Last Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investors.map((investor) => {
            const investorWallets = wallets.filter((w) => w.investorId === investor.id);
            const walletStats = getWalletStats(investor.id);
            const appCount = getApplicationStats(investor.id);
            const approvalLevel = getApprovalLevel(investor, investorWallets);

            return (
              <TableRow
                key={investor.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedId === investor.id && "bg-primary/5 border-l-2 border-l-primary"
                )}
                onClick={() => onSelect(investor.id)}
              >
                {/* Name with approval indicator */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <ApprovalLevelIcon level={approvalLevel} className="shrink-0" />
                    <span className="truncate">{investor.fullName}</span>
                  </div>
                </TableCell>

                {/* Email with copy/mail actions */}
                <TableCell>
                  <div className="flex items-center gap-1 group">
                    <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                      {investor.email}
                    </span>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(investor.email, "Email");
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`mailto:${investor.email}`);
                        }}
                      >
                        <Mail className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>

                {/* Phone with copy/call actions */}
                <TableCell>
                  <div className="flex items-center gap-1 group">
                    <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                      {investor.phone}
                    </span>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(investor.phone, "Phone");
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${investor.phone.replace(/\D/g, "")}`);
                        }}
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>

                {/* Signup Date */}
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(investor.createdAt)}
                </TableCell>

                {/* KYC Status */}
                <TableCell className="text-center">
                  <KycStatusIcon status={investor.kycStatus} />
                </TableCell>

                {/* Accreditation */}
                <TableCell>
                  <AccreditationBadge status={investor.accreditationStatus} />
                </TableCell>

                {/* Wallet PermissionDEX */}
                <TableCell className="text-center">
                  <PermissionDexIcon
                    hasApproved={walletStats.hasApproved}
                    hasPending={walletStats.hasPending}
                  />
                </TableCell>

                {/* Approval Level */}
                <TableCell>
                  <ApprovalLevelBadge level={approvalLevel} />
                </TableCell>

                {/* Application Count */}
                <TableCell className="text-center text-sm text-muted-foreground">
                  {appCount > 0 ? appCount : "—"}
                </TableCell>

                {/* Last Action */}
                <TableCell className="text-sm text-muted-foreground">
                  {getLastAction(investor, investorWallets)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {investors.length === 0 && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <p className="text-sm">No investors match your search criteria.</p>
        </div>
      )}
    </div>
  );
};
