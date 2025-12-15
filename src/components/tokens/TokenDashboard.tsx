import React, { useState, useMemo } from "react";
import { Token, TokenStandard, TokenStatus } from "@/types/token";
import { mockTokens } from "@/data/mockTokens";
import { TokenTable } from "./TokenTable";
import { TokenFilters } from "./TokenFilters";
import { TokenDetails } from "./TokenDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Coins, FileText, Snowflake, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";

interface TokenDashboardProps {
  role: Role;
}

export const TokenDashboard: React.FC<TokenDashboardProps> = ({ role }) => {
  const navigate = useNavigate();
  const [tokens] = useState<Token[]>(mockTokens);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [standardFilter, setStandardFilter] = useState<TokenStandard | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<TokenStatus | "ALL">("ALL");

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

  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      const matchesSearch = 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.issuerWalletAddress.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStandard = standardFilter === "ALL" || token.standard === standardFilter;
      const matchesStatus = statusFilter === "ALL" || token.status === statusFilter;
      
      return matchesSearch && matchesStandard && matchesStatus;
    });
  }, [tokens, searchQuery, standardFilter, statusFilter]);

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
        standardFilter={standardFilter}
        onStandardFilterChange={setStandardFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Token Table */}
      <TokenTable 
        tokens={filteredTokens} 
        onSelectToken={setSelectedToken}
      />
    </div>
  );
};
