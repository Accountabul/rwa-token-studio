import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { InvestorWallet, InvestorApplication } from "@/types/investor";
import {
  mockInvestors,
  mockWallets,
  mockApplications,
} from "@/data/mockInvestors";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { InvestorProfilePage } from "@/components/investor/InvestorProfilePage";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const InvestorProfile: React.FC = () => {
  const { investorId } = useParams<{ investorId: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("SUPER_ADMIN");
  const [wallets, setWallets] = useState<InvestorWallet[]>(mockWallets);

  const investor = useMemo(
    () => mockInvestors.find((i) => i.id === investorId) ?? null,
    [investorId]
  );

  const investorWallets = useMemo(
    () => wallets.filter((w) => w.investorId === investorId),
    [wallets, investorId]
  );

  const investorApplications = useMemo(
    () => mockApplications.filter((a) => a.investorId === investorId),
    [investorId]
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

  if (!investor) {
    return (
      <div className="min-h-screen bg-background flex">
        <AppSidebar role={role} onRoleChange={setRole} />
        <main className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">Investor not found</p>
          <Button variant="outline" onClick={() => navigate("/investors")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Investors
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar role={role} onRoleChange={setRole} />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <InvestorProfilePage
          investor={investor}
          wallets={investorWallets}
          applications={investorApplications}
          onSyncWallet={handleSyncWallet}
          onBack={() => navigate("/investors")}
        />
      </main>
    </div>
  );
};

export default InvestorProfile;
