import React from "react";
import { useNavigate } from "react-router-dom";
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
  canParticipate,
} from "@/types/investor";
import {
  KycStatusIcon,
  AccreditationBadge,
  ApprovalLevelIcon,
} from "./InvestorStatusBadges";
import { CheckCircle2, XCircle, AlertCircle, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InvestorTableProps {
  investors: Investor[];
  wallets: InvestorWallet[];
  applications: InvestorApplication[];
}

export const InvestorTable: React.FC<InvestorTableProps> = ({
  investors,
  wallets,
  applications,
}) => {
  const navigate = useNavigate();

  const getWalletStats = (investorId: string) => {
    const investorWallets = wallets.filter((w) => w.investorId === investorId);
    const permissioned = investorWallets.filter(
      (w) => w.permissionDexStatus === "APPROVED"
    ).length;
    return { total: investorWallets.length, permissioned };
  };

  const getEligibility = (investor: Investor, investorWallets: InvestorWallet[]) => {
    const approvedWallet = investorWallets.find(
      (w) => w.permissionDexStatus === "APPROVED"
    );
    if (approvedWallet && canParticipate(investor, approvedWallet)) {
      return "eligible";
    }
    if (investor.kycStatus === "APPROVED") {
      return "partial";
    }
    return "blocked";
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

  const handleRowClick = (investorId: string) => {
    navigate(`/investors/${investorId}`);
  };

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
          <TableRow>
            <TableHead className="w-[220px]">Investor</TableHead>
            <TableHead className="w-[80px] text-center">KYC</TableHead>
            <TableHead className="w-[130px]">Accreditation</TableHead>
            <TableHead className="w-[100px] text-center">Wallets</TableHead>
            <TableHead className="w-[100px] text-center">Eligible</TableHead>
            <TableHead className="w-[100px]">Last Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investors.map((investor) => {
            const investorWallets = wallets.filter((w) => w.investorId === investor.id);
            const walletStats = getWalletStats(investor.id);
            const approvalLevel = getApprovalLevel(investor, investorWallets);
            const eligibility = getEligibility(investor, investorWallets);

            return (
              <TableRow
                key={investor.id}
                onClick={() => handleRowClick(investor.id)}
                className="cursor-pointer transition-colors hover:bg-muted/60"
              >
                {/* Investor Name with approval indicator */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <ApprovalLevelIcon level={approvalLevel} className="shrink-0" />
                    <span className="truncate">{investor.fullName}</span>
                  </div>
                </TableCell>

                {/* KYC Status */}
                <TableCell className="text-center">
                  <KycStatusIcon status={investor.kycStatus} />
                </TableCell>

                {/* Accreditation */}
                <TableCell>
                  <AccreditationBadge status={investor.accreditationStatus} />
                </TableCell>

                {/* Wallets: Permissioned / Total */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm">
                      <span
                        className={cn(
                          walletStats.permissioned > 0
                            ? "text-emerald-600 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {walletStats.permissioned}
                      </span>
                      <span className="text-muted-foreground">/{walletStats.total}</span>
                    </span>
                  </div>
                </TableCell>

                {/* Eligibility */}
                <TableCell className="text-center">
                  {eligibility === "eligible" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                  )}
                  {eligibility === "partial" && (
                    <AlertCircle className="w-4 h-4 text-amber-500 mx-auto" />
                  )}
                  {eligibility === "blocked" && (
                    <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                  )}
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
