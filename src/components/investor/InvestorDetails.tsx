import React from "react";
import {
  Investor,
  InvestorWallet,
  InvestorApplication,
} from "@/types/investor";
import { InvestorSummaryCard } from "./InvestorSummaryCard";
import { WalletSection } from "./WalletSection";
import { ApplicationsSection } from "./ApplicationsSection";

interface InvestorDetailsProps {
  investor: Investor;
  wallets: InvestorWallet[];
  applications: InvestorApplication[];
  onSyncWallet: (walletId: string) => void;
}

export const InvestorDetails: React.FC<InvestorDetailsProps> = ({
  investor,
  wallets,
  applications,
  onSyncWallet,
}) => {
  return (
    <section className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
      <InvestorSummaryCard investor={investor} wallets={wallets} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WalletSection wallets={wallets} onSyncWallet={onSyncWallet} />
        <ApplicationsSection
          investor={investor}
          applications={applications}
          wallets={wallets}
        />
      </div>
    </section>
  );
};
