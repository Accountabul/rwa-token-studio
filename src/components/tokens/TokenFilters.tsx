import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TokenAdvancedFilters, TokenFiltersState } from "./TokenAdvancedFilters";
import { TokenSortDropdown, SortField } from "./TokenSortDropdown";

interface TokenFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: TokenFiltersState;
  onFiltersChange: (filters: TokenFiltersState) => void;
  sortBy: SortField;
  onSortChange: (sort: SortField) => void;
}

export const TokenFilters: React.FC<TokenFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tokens by name, symbol, or address..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>
      
      <div className="flex gap-2">
        <TokenAdvancedFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
        <TokenSortDropdown
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </div>
    </div>
  );
};
