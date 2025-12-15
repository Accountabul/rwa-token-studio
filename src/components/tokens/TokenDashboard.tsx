import React, { useState, useMemo } from "react";
import { Token } from "@/types/token";
import { mockTokens } from "@/data/mockTokens";
import { TokenTable } from "./TokenTable";
import { TokenFilters } from "./TokenFilters";
import { TokenDetails } from "./TokenDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Coins, FileText, Snowflake, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { TokenFiltersState, defaultFilters } from "./TokenAdvancedFilters";
import { SortField } from "./TokenSortDropdown";

interface TokenDashboardProps {
  role: Role;
}

export const TokenDashboard: React.FC<TokenDashboardProps> = ({ role }) => {
  const navigate = useNavigate();
  const [tokens] = useState<Token[]>(mockTokens);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TokenFiltersState>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortField>("created_desc");

  const stats = useMemo(() => {
    const issued = tokens.filter((t) => t.status === "ISSUED").length;
    const frozen = tokens.filter((t) => t.status === "FROZEN").length;
    const draft = tokens.filter((t) => t.status === "DRAFT").length;
    const retired = tokens.filter((t) => t.status === "RETIRED").length;
    
    const byStandard = {
      IOU: tokens.filter((t) => t.standard === "IOU").length,
      MPT: tokens.filter((t) => t.standard === "MPT").length,
      NFT: tokens.filter((t) => t.standard === "NFT").length,
    };

    return { total: tokens.length, issued, frozen, draft, retired, byStandard };
  }, [tokens]);

  const filteredAndSortedTokens = useMemo(() => {
    let result = tokens.filter((token) => {
      // Search filter
      const matchesSearch = 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.issuerWalletAddress.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Standard filter
      if (filters.standards.length > 0 && !filters.standards.includes(token.standard)) {
        return false;
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(token.status)) {
        return false;
      }

      // Compliance filters
      if (filters.kycRequired !== "ALL") {
        const required = filters.kycRequired === "YES";
        if (token.compliance.kycRequired !== required) return false;
      }

      if (filters.accreditationRequired !== "ALL") {
        const required = filters.accreditationRequired === "YES";
        if (token.compliance.accreditationRequired !== required) return false;
      }

      if (filters.permissionDexEnforced !== "ALL") {
        const enforced = filters.permissionDexEnforced === "YES";
        if (token.compliance.permissionDexEnforced !== enforced) return false;
      }

      if (filters.hasTransferRestrictions !== "ALL") {
        const hasRestrictions = !!token.compliance.transferRestrictions;
        const wantsRestrictions = filters.hasTransferRestrictions === "YES";
        if (hasRestrictions !== wantsRestrictions) return false;
      }

      // Jurisdictions filter
      if (filters.jurisdictions.length > 0) {
        const hasMatchingJurisdiction = filters.jurisdictions.some((j) =>
          token.compliance.jurisdictions.includes(j)
        );
        if (!hasMatchingJurisdiction) return false;
      }

      // Supply range
      if (filters.minSupply) {
        const min = parseInt(filters.minSupply);
        if (!isNaN(min) && token.totalIssued < min) return false;
      }

      if (filters.maxSupply) {
        const max = parseInt(filters.maxSupply);
        if (!isNaN(max) && token.totalIssued > max) return false;
      }

      // Asset classification
      if (filters.assetClass !== "ALL" && token.assetClass !== filters.assetClass) {
        return false;
      }

      if (filters.assetSubclass !== "ALL" && token.assetSubclass !== filters.assetSubclass) {
        return false;
      }

      // Source project
      if (filters.hasSourceProject !== "ALL") {
        const hasProject = !!token.sourceProjectId;
        const wantsProject = filters.hasSourceProject === "YES";
        if (hasProject !== wantsProject) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "symbol_asc":
          return a.symbol.localeCompare(b.symbol);
        case "symbol_desc":
          return b.symbol.localeCompare(a.symbol);
        case "supply_desc":
          return b.totalIssued - a.totalIssued;
        case "supply_asc":
          return a.totalIssued - b.totalIssued;
        case "max_supply_desc":
          return (b.maxSupply || 0) - (a.maxSupply || 0);
        case "max_supply_asc":
          return (a.maxSupply || 0) - (b.maxSupply || 0);
        case "circulating_desc":
          return b.circulatingSupply - a.circulatingSupply;
        case "circulating_asc":
          return a.circulatingSupply - b.circulatingSupply;
        case "escrow_desc":
          return b.inEscrow - a.inEscrow;
        case "escrow_asc":
          return a.inEscrow - b.inEscrow;
        case "created_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "created_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "issued_desc":
          if (!a.issuedAt) return 1;
          if (!b.issuedAt) return -1;
          return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
        case "issued_asc":
          if (!a.issuedAt) return 1;
          if (!b.issuedAt) return -1;
          return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [tokens, searchQuery, filters, sortBy]);

  const canCreateToken = role === "SUPER_ADMIN" || role === "TOKENIZATION_MANAGER";

  if (selectedToken) {
    return (
      <TokenDetails 
        token={selectedToken} 
        role={role}
        onBack={() => setSelectedToken(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Token Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tokens issued on the XRP Ledger
          </p>
        </div>
        {canCreateToken && (
          <Button onClick={() => navigate("/tokens/create")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Token
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.issued}</p>
                <p className="text-xs text-muted-foreground">Issued</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.draft}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Snowflake className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.frozen}</p>
                <p className="text-xs text-muted-foreground">Frozen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <Archive className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.retired}</p>
                <p className="text-xs text-muted-foreground">Retired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <TokenFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Token Table */}
      <TokenTable 
        tokens={filteredAndSortedTokens} 
        onSelectToken={setSelectedToken}
      />
    </div>
  );
};
