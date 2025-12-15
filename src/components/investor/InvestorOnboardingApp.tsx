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
        const hasApprovedWallet = investorWallets.some(
          (w) => w.permissionDexStatus === "APPROVED"
        );

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

  const selectedInvestor =
    investors.find((i) => i.id === selectedInvestorId) ?? null;
  const investorWallets = wallets.filter(
    (w) => w.investorId === selectedInvestorId
  );
  const investorApplications = applications.filter(
    (a) => a.investorId === selectedInvestorId
  );

  const handleSyncWallet = (walletId: string) => {
    toast.info("Syncing PermissionDEX status...");
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
      phone: "+1 (555) 000-0000",
      jurisdiction: "US-MO",
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

        <div className="flex flex-1 min-h-0">
          {/* Left: Table View */}
          <div className="flex-1 flex flex-col border-r border-border min-w-0">
            <InvestorTable
              investors={filteredInvestors}
              wallets={wallets}
              applications={applications}
              selectedId={selectedInvestorId}
              onSelect={setSelectedInvestorId}
            />
          </div>

          {/* Right: Detail Panel */}
          <div className="w-[420px] shrink-0">
            {selectedInvestor ? (
              <InvestorDetails
                investor={selectedInvestor}
                wallets={investorWallets}
                applications={investorApplications}
                onSyncWallet={handleSyncWallet}
              />
            ) : (
              <div className="flex-1 h-full flex flex-col items-center justify-center text-muted-foreground p-6">
                <UserSearch className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm text-center">
                  Select an investor from the table to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
