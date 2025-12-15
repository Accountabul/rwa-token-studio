import React, { useState, useMemo } from "react";
import { Role } from "@/types/tokenization";
import {
  Investor,
  InvestorWallet,
  InvestorApplication,
  InvestorFilter,
  getApprovalLevel,
} from "@/types/investor";
import {
  mockInvestors,
  mockWallets,
  mockApplications,
} from "@/data/mockInvestors";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { InvestorHeader } from "./InvestorHeader";
import { InvestorTable } from "./InvestorTable";
import { toast } from "sonner";

export const InvestorOnboardingApp: React.FC = () => {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");
  const [investors, setInvestors] = useState<Investor[]>(mockInvestors);
  const [wallets] = useState<InvestorWallet[]>(mockWallets);
  const [applications] = useState<InvestorApplication[]>(mockApplications);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<InvestorFilter>("ALL");

  // Filter and search logic
  const filteredInvestors = useMemo(() => {
    let result = investors;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((investor) => {
        const investorWallets = wallets.filter((w) => w.investorId === investor.id);
        return (
          investor.fullName.toLowerCase().includes(query) ||
          investor.email.toLowerCase().includes(query) ||
          investor.phone.toLowerCase().includes(query) ||
          investorWallets.some((w) =>
            w.xrplAddress.toLowerCase().includes(query)
          )
        );
      });
    }

    // Apply filter
    if (activeFilter !== "ALL") {
      result = result.filter((investor) => {
        const investorWallets = wallets.filter((w) => w.investorId === investor.id);
        const approvalLevel = getApprovalLevel(investor, investorWallets);

        switch (activeFilter) {
          case "NOT_STARTED":
            return (
              investor.kycStatus === "PENDING" &&
              investorWallets.length === 0
            );
          case "KYC_SUBMITTED":
            return investor.kycStatus === "PENDING";
          case "KYC_APPROVED":
            return investor.kycStatus === "APPROVED";
          case "ACCREDITED":
            return investor.accreditationStatus === "ACCREDITED";
          case "FULLY_APPROVED":
            return approvalLevel === "FULLY_APPROVED";
          default:
            return true;
        }
      });
    }

    return result;
  }, [investors, wallets, searchQuery, activeFilter]);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const counts: Record<InvestorFilter, number> = {
      ALL: investors.length,
      NOT_STARTED: 0,
      KYC_SUBMITTED: 0,
      KYC_APPROVED: 0,
      ACCREDITED: 0,
      FULLY_APPROVED: 0,
    };

    investors.forEach((investor) => {
      const investorWallets = wallets.filter((w) => w.investorId === investor.id);
      const approvalLevel = getApprovalLevel(investor, investorWallets);

      if (investor.kycStatus === "PENDING" && investorWallets.length === 0) {
        counts.NOT_STARTED++;
      }
      if (investor.kycStatus === "PENDING") {
        counts.KYC_SUBMITTED++;
      }
      if (investor.kycStatus === "APPROVED") {
        counts.KYC_APPROVED++;
      }
      if (investor.accreditationStatus === "ACCREDITED") {
        counts.ACCREDITED++;
      }
      if (approvalLevel === "FULLY_APPROVED") {
        counts.FULLY_APPROVED++;
      }
    });

    return counts;
  }, [investors, wallets]);

  const handleNewInvestor = () => {
    const id = `inv-${String(investors.length + 1).padStart(3, "0")}`;
    const newInvestor: Investor = {
      id,
      fullName: "New Investor",
      email: `investor${investors.length + 1}@example.com`,
      phone: "+1 (555) 000-0000",
      jurisdiction: "US-MO",
      createdAt: new Date().toISOString(),
      kycStatus: "PENDING",
      accreditationStatus: "N_A",
    };
    setInvestors((prev) => [newInvestor, ...prev]);
    toast.success("New investor created", {
      description: "Click on the investor row to view details.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar role={role} onRoleChange={setRole} />

      <main className="flex-1 flex flex-col min-h-screen">
        <InvestorHeader
          onNewInvestor={handleNewInvestor}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filterCounts={filterCounts}
        />

        <div className="flex-1 min-h-0">
          <InvestorTable
            investors={filteredInvestors}
            wallets={wallets}
            applications={applications}
          />
        </div>
      </main>
    </div>
  );
};
