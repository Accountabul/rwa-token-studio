import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { TokenStandard, TokenStatus, tokenStandardLabel, tokenStatusLabel } from "@/types/token";

interface TokenFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  standardFilter: TokenStandard | "ALL";
  onStandardFilterChange: (value: TokenStandard | "ALL") => void;
  statusFilter: TokenStatus | "ALL";
  onStatusFilterChange: (value: TokenStatus | "ALL") => void;
}

export const TokenFilters: React.FC<TokenFiltersProps> = ({
  searchQuery,
  onSearchChange,
  standardFilter,
  onStandardFilterChange,
  statusFilter,
  onStatusFilterChange,
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
      
      <Select value={standardFilter} onValueChange={(v) => onStandardFilterChange(v as TokenStandard | "ALL")}>
        <SelectTrigger className="w-full sm:w-40 bg-card border-border">
          <SelectValue placeholder="Standard" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Standards</SelectItem>
          {(Object.keys(tokenStandardLabel) as TokenStandard[]).map((std) => (
            <SelectItem key={std} value={std}>{std}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as TokenStatus | "ALL")}>
        <SelectTrigger className="w-full sm:w-40 bg-card border-border">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          {(Object.keys(tokenStatusLabel) as TokenStatus[]).map((status) => (
            <SelectItem key={status} value={status}>{tokenStatusLabel[status]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
