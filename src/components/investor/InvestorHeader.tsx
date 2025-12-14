import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Search } from "lucide-react";
import { InvestorFilter, investorFilterLabel } from "@/types/investor";
import { cn } from "@/lib/utils";

interface InvestorHeaderProps {
  onNewInvestor: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: InvestorFilter;
  onFilterChange: (filter: InvestorFilter) => void;
  filterCounts: Record<InvestorFilter, number>;
}

const filters: InvestorFilter[] = [
  "ALL",
  "NOT_STARTED",
  "KYC_SUBMITTED",
  "KYC_APPROVED",
  "ACCREDITED",
  "FULLY_APPROVED",
];

export const InvestorHeader: React.FC<InvestorHeaderProps> = ({
  onNewInvestor,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filterCounts,
}) => {
  return (
    <header className="border-b border-border bg-card">
      <div className="px-6 py-4 flex items-center justify-between">
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
      </div>

      {/* Search and Filters */}
      <div className="px-6 pb-4 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or wallet..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                activeFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {investorFilterLabel[filter]}
              <span className="ml-1.5 opacity-70">({filterCounts[filter]})</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
