import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown } from "lucide-react";

export type SortField = 
  | "name_asc" 
  | "name_desc" 
  | "symbol_asc" 
  | "symbol_desc"
  | "supply_desc" 
  | "supply_asc"
  | "max_supply_desc"
  | "max_supply_asc"
  | "circulating_desc"
  | "circulating_asc"
  | "escrow_desc"
  | "escrow_asc"
  | "created_desc" 
  | "created_asc"
  | "issued_desc"
  | "issued_asc";

export const SORT_OPTIONS: { value: SortField; label: string; category: string }[] = [
  // Alphabetical
  { value: "name_asc", label: "Name (A → Z)", category: "Alphabetical" },
  { value: "name_desc", label: "Name (Z → A)", category: "Alphabetical" },
  { value: "symbol_asc", label: "Symbol (A → Z)", category: "Alphabetical" },
  { value: "symbol_desc", label: "Symbol (Z → A)", category: "Alphabetical" },
  // Supply
  { value: "supply_desc", label: "Total Supply (Highest)", category: "Supply" },
  { value: "supply_asc", label: "Total Supply (Lowest)", category: "Supply" },
  { value: "max_supply_desc", label: "Max Supply (Highest)", category: "Supply" },
  { value: "max_supply_asc", label: "Max Supply (Lowest)", category: "Supply" },
  { value: "circulating_desc", label: "Circulating (Highest)", category: "Supply" },
  { value: "circulating_asc", label: "Circulating (Lowest)", category: "Supply" },
  { value: "escrow_desc", label: "In Escrow (Highest)", category: "Supply" },
  { value: "escrow_asc", label: "In Escrow (Lowest)", category: "Supply" },
  // Dates
  { value: "created_desc", label: "Recently Created", category: "Date" },
  { value: "created_asc", label: "Oldest Created", category: "Date" },
  { value: "issued_desc", label: "Recently Issued", category: "Date" },
  { value: "issued_asc", label: "Oldest Issued", category: "Date" },
];

interface TokenSortDropdownProps {
  sortBy: SortField;
  onSortChange: (sort: SortField) => void;
}

export const TokenSortDropdown: React.FC<TokenSortDropdownProps> = ({
  sortBy,
  onSortChange,
}) => {
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Sort";

  // Group options by category
  const categories = SORT_OPTIONS.reduce((acc, opt) => {
    if (!acc[opt.category]) acc[opt.category] = [];
    acc[opt.category].push(opt);
    return acc;
  }, {} as Record<string, typeof SORT_OPTIONS>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-card border-border min-w-[180px] justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <span className="text-sm truncate">{currentLabel}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => onSortChange(v as SortField)}>
          {Object.entries(categories).map(([category, options], idx) => (
            <React.Fragment key={category}>
              {idx > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {category}
              </DropdownMenuLabel>
              {options.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </React.Fragment>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
