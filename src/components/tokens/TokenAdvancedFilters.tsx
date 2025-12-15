import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { TokenStandard, TokenStatus, tokenStandardLabel, tokenStatusLabel } from "@/types/token";

export interface TokenFiltersState {
  standards: TokenStandard[];
  statuses: TokenStatus[];
  kycRequired: "ALL" | "YES" | "NO";
  accreditationRequired: "ALL" | "YES" | "NO";
  permissionDexEnforced: "ALL" | "YES" | "NO";
  hasTransferRestrictions: "ALL" | "YES" | "NO";
  jurisdictions: string[];
  minSupply: string;
  maxSupply: string;
  assetClass: "ALL" | "rwa_re";
  assetSubclass: string;
  hasSourceProject: "ALL" | "YES" | "NO";
}

export const defaultFilters: TokenFiltersState = {
  standards: [],
  statuses: [],
  kycRequired: "ALL",
  accreditationRequired: "ALL",
  permissionDexEnforced: "ALL",
  hasTransferRestrictions: "ALL",
  jurisdictions: [],
  minSupply: "",
  maxSupply: "",
  assetClass: "ALL",
  assetSubclass: "ALL",
  hasSourceProject: "ALL",
};

const ALL_JURISDICTIONS = ["US", "US-DE", "US-NY", "US-CA", "US-TX", "US-FL", "EU", "UK", "SG", "HK"];
const ASSET_SUBCLASSES = [
  { value: "ALL", label: "All Subclasses" },
  { value: "sfr", label: "Single Family Residential" },
  { value: "mfr", label: "Multi-Family Residential" },
  { value: "office", label: "Commercial Office" },
  { value: "retail", label: "Commercial Retail" },
  { value: "industrial", label: "Industrial" },
  { value: "mixed", label: "Mixed Use" },
  { value: "hospitality", label: "Hospitality" },
  { value: "land", label: "Land/Development" },
];

interface TokenAdvancedFiltersProps {
  filters: TokenFiltersState;
  onFiltersChange: (filters: TokenFiltersState) => void;
}

export const TokenAdvancedFilters: React.FC<TokenAdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const activeFilterCount = countActiveFilters(filters);

  const handleStandardToggle = (standard: TokenStandard) => {
    const newStandards = filters.standards.includes(standard)
      ? filters.standards.filter((s) => s !== standard)
      : [...filters.standards, standard];
    onFiltersChange({ ...filters, standards: newStandards });
  };

  const handleStatusToggle = (status: TokenStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const handleJurisdictionToggle = (jurisdiction: string) => {
    const newJurisdictions = filters.jurisdictions.includes(jurisdiction)
      ? filters.jurisdictions.filter((j) => j !== jurisdiction)
      : [...filters.jurisdictions, jurisdiction];
    onFiltersChange({ ...filters, jurisdictions: newJurisdictions });
  };

  const clearAllFilters = () => {
    onFiltersChange(defaultFilters);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 bg-card border-border">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h4 className="font-medium text-sm text-foreground">Filters</h4>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto p-4 space-y-5">
          {/* Token Basics */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Token Basics
            </h5>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Standard</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(tokenStandardLabel) as TokenStandard[]).map((std) => (
                  <label
                    key={std}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.standards.includes(std)}
                      onCheckedChange={() => handleStandardToggle(std)}
                    />
                    <span className="text-sm">{std}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(tokenStatusLabel) as TokenStatus[]).map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.statuses.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <span className="text-sm">{tokenStatusLabel[status]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Supply Range */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Supply Range
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Min Supply</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minSupply}
                  onChange={(e) => onFiltersChange({ ...filters, minSupply: e.target.value })}
                  className="h-8 bg-card border-border"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Max Supply</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filters.maxSupply}
                  onChange={(e) => onFiltersChange({ ...filters, maxSupply: e.target.value })}
                  className="h-8 bg-card border-border"
                />
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Compliance
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">KYC Required</Label>
                <Select
                  value={filters.kycRequired}
                  onValueChange={(v) => onFiltersChange({ ...filters, kycRequired: v as "ALL" | "YES" | "NO" })}
                >
                  <SelectTrigger className="h-8 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="YES">Yes</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Accreditation</Label>
                <Select
                  value={filters.accreditationRequired}
                  onValueChange={(v) => onFiltersChange({ ...filters, accreditationRequired: v as "ALL" | "YES" | "NO" })}
                >
                  <SelectTrigger className="h-8 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="YES">Required</SelectItem>
                    <SelectItem value="NO">Not Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">PermissionDEX</Label>
                <Select
                  value={filters.permissionDexEnforced}
                  onValueChange={(v) => onFiltersChange({ ...filters, permissionDexEnforced: v as "ALL" | "YES" | "NO" })}
                >
                  <SelectTrigger className="h-8 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="YES">Enforced</SelectItem>
                    <SelectItem value="NO">Not Enforced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Transfer Restrictions</Label>
                <Select
                  value={filters.hasTransferRestrictions}
                  onValueChange={(v) => onFiltersChange({ ...filters, hasTransferRestrictions: v as "ALL" | "YES" | "NO" })}
                >
                  <SelectTrigger className="h-8 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="YES">Has Restrictions</SelectItem>
                    <SelectItem value="NO">No Restrictions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Jurisdictions */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Jurisdictions
            </h5>
            <div className="flex flex-wrap gap-2">
              {ALL_JURISDICTIONS.map((jurisdiction) => (
                <label
                  key={jurisdiction}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <Checkbox
                    checked={filters.jurisdictions.includes(jurisdiction)}
                    onCheckedChange={() => handleJurisdictionToggle(jurisdiction)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="text-xs">{jurisdiction}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Asset Classification */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Asset Classification
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Asset Class</Label>
                <Select
                  value={filters.assetClass}
                  onValueChange={(v) => onFiltersChange({ ...filters, assetClass: v as "ALL" | "rwa_re" })}
                >
                  <SelectTrigger className="h-8 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Classes</SelectItem>
                    <SelectItem value="rwa_re">Real Estate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Subclass</Label>
                <Select
                  value={filters.assetSubclass}
                  onValueChange={(v) => onFiltersChange({ ...filters, assetSubclass: v })}
                >
                  <SelectTrigger className="h-8 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_SUBCLASSES.map((sc) => (
                      <SelectItem key={sc.value} value={sc.value}>
                        {sc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Linked to Project</Label>
              <Select
                value={filters.hasSourceProject}
                onValueChange={(v) => onFiltersChange({ ...filters, hasSourceProject: v as "ALL" | "YES" | "NO" })}
              >
                <SelectTrigger className="h-8 bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="YES">Has Project Link</SelectItem>
                  <SelectItem value="NO">No Project Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

function countActiveFilters(filters: TokenFiltersState): number {
  let count = 0;
  if (filters.standards.length > 0) count++;
  if (filters.statuses.length > 0) count++;
  if (filters.kycRequired !== "ALL") count++;
  if (filters.accreditationRequired !== "ALL") count++;
  if (filters.permissionDexEnforced !== "ALL") count++;
  if (filters.hasTransferRestrictions !== "ALL") count++;
  if (filters.jurisdictions.length > 0) count++;
  if (filters.minSupply) count++;
  if (filters.maxSupply) count++;
  if (filters.assetClass !== "ALL") count++;
  if (filters.assetSubclass !== "ALL") count++;
  if (filters.hasSourceProject !== "ALL") count++;
  return count;
}
