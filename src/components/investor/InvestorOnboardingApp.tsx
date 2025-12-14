import React, { useState } from "react";
import { Role } from "@/types/tokenization";
import {
  Investor,
  InvestorWallet,
  InvestorApplication,
  PermissionDexStatus,
} from "@/types/investor";
import {
  mockInvestors,
  mockWallets,
  mockApplications,
} from "@/data/mockInvestors";
import { InvestorSidebar } from "./InvestorSidebar";
import { InvestorHeader } from "./InvestorHeader";
import { InvestorList } from "./InvestorList";
import { InvestorDetails } from "./InvestorDetails";
import { UserSearch } from "lucide-react";
import { toast } from "sonner";

export const InvestorOnboardingApp: React.FC = () => {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");
  const [investors, setInvestors] = useState<Investor[]>(mockInvestors);
  const [wallets, setWallets] = useState<InvestorWallet[]>(mockWallets);
  const [applications] = useState<InvestorApplication[]>(mockApplications);
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(
    mockInvestors[0]?.id ?? null
  );

  const selectedInvestor =
    investors.find((i) => i.id === selectedInvestorId) ?? null;
  const investorWallets = wallets.filter(
    (w) => w.investorId === selectedInvestorId
  );
  const investorApplications = applications.filter(
    (a) => a.investorId === selectedInvestorId
  );

  const handleSyncWallet = (walletId: string) => {
    // Simulate PermissionDEX sync - in production this would call the actual API
    setTimeout(() => {
      setWallets((prev) =>
        prev.map((w) =>
          w.id === walletId
            ? { ...w, lastSyncAt: new Date().toISOString() }
            : w
        )
      );
      toast.success("PermissionDEX sync complete", {
        description: "Wallet status has been updated.",
      });
    }, 1500);
  };

  const handleNewInvestor = () => {
    const id = `inv-${String(investors.length + 1).padStart(3, "0")}`;
    const newInvestor: Investor = {
      id,
      fullName: "New Investor",
      email: `investor${investors.length + 1}@example.com`,
      createdAt: new Date().toISOString(),
      kycStatus: "PENDING",
      accreditationStatus: "N_A",
    };
    setInvestors((prev) => [newInvestor, ...prev]);
    setSelectedInvestorId(newInvestor.id);
    toast.success("New investor created", {
      description: "Fill in the investor details to proceed with onboarding.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <InvestorSidebar role={role} onRoleChange={setRole} />

      <main className="flex-1 flex flex-col min-h-screen">
        <InvestorHeader onNewInvestor={handleNewInvestor} />

        <div className="flex flex-1 min-h-0">
          <InvestorList
            investors={investors}
            wallets={wallets}
            selectedId={selectedInvestorId}
            onSelect={setSelectedInvestorId}
          />

          {selectedInvestor ? (
            <InvestorDetails
              investor={selectedInvestor}
              wallets={investorWallets}
              applications={investorApplications}
              onSyncWallet={handleSyncWallet}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <UserSearch className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">Select an investor to view details</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
