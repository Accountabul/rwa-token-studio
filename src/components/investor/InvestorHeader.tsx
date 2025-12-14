import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

interface InvestorHeaderProps {
  onNewInvestor: () => void;
}

export const InvestorHeader: React.FC<InvestorHeaderProps> = ({
  onNewInvestor,
}) => {
  return (
    <header className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Investor Onboarding
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage investor KYC, wallets, and project participation.
          </p>
        </div>
      </div>
      <Button onClick={onNewInvestor} className="gap-2">
        <Plus className="w-4 h-4" />
        New Investor
      </Button>
    </header>
  );
};
