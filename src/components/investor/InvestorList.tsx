import React from "react";
import { cn } from "@/lib/utils";
import { Investor, InvestorWallet } from "@/types/investor";
import { KycStatusBadge, AccreditationBadge } from "./InvestorStatusBadges";
import { Wallet, CheckCircle2 } from "lucide-react";

interface InvestorListProps {
  investors: Investor[];
  wallets: InvestorWallet[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const InvestorList: React.FC<InvestorListProps> = ({
  investors,
  wallets,
  selectedId,
  onSelect,
}) => {
  const getWalletStats = (investorId: string) => {
    const investorWallets = wallets.filter((w) => w.investorId === investorId);
    const approvedCount = investorWallets.filter(
      (w) => w.permissionDexStatus === "APPROVED"
    ).length;
    return { total: investorWallets.length, approved: approvedCount };
  };

  return (
    <section className="w-80 border-r border-border bg-muted/30 overflow-y-auto scrollbar-thin">
      <div className="sticky top-0 bg-muted/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Investors</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {investors.length} total investors
        </p>
      </div>
      <ul className="divide-y divide-border">
        {investors.map((investor) => {
          const walletStats = getWalletStats(investor.id);
          return (
            <li key={investor.id}>
              <button
                onClick={() => onSelect(investor.id)}
                className={cn(
                  "flex w-full flex-col items-start px-4 py-3.5 text-left transition-all duration-200 hover:bg-muted/50",
                  selectedId === investor.id &&
                    "bg-background border-l-4 border-l-primary shadow-sm"
                )}
              >
                <span className="font-medium text-foreground text-sm line-clamp-1">
                  {investor.fullName}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {investor.email}
                </span>
                
                <div className="flex items-center gap-2 mt-2 w-full">
                  <KycStatusBadge status={investor.kycStatus} />
                  <AccreditationBadge status={investor.accreditationStatus} />
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    {walletStats.total} wallet{walletStats.total !== 1 && "s"}
                  </span>
                  {walletStats.approved > 0 && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      {walletStats.approved} approved
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
