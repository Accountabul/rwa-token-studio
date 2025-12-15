import React from "react";
import { Token } from "@/types/token";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TokenStatusBadge, TokenStandardBadge } from "./TokenStatusBadge";
import { ExternalLink, MoreHorizontal, Eye, Snowflake, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface TokenTableProps {
  tokens: Token[];
  onSelectToken: (token: Token) => void;
}

export const TokenTable: React.FC<TokenTableProps> = ({ tokens, onSelectToken }) => {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatSupply = (token: Token) => {
    const issued = token.totalIssued.toLocaleString();
    if (token.maxSupply) {
      return `${issued} / ${token.maxSupply.toLocaleString()}`;
    }
    return issued;
  };

  const formatIssuedDate = (token: Token) => {
    if (!token.issuedAt) return "—";
    return format(new Date(token.issuedAt), "MMM d, yyyy");
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-xs font-semibold text-muted-foreground">Token</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Standard</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Issuer</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Supply</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Issued Date</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Compliance</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No tokens found
              </TableCell>
            </TableRow>
          ) : (
            tokens.map((token) => (
              <TableRow 
                key={token.id} 
                className="cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => onSelectToken(token)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-sm text-foreground">{token.name}</p>
                    <p className="text-xs text-muted-foreground">{token.symbol}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <TokenStandardBadge standard={token.standard} />
                </TableCell>
                <TableCell>
                  <code className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                    {truncateAddress(token.issuerWalletAddress)}
                  </code>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-foreground">{formatSupply(token)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{formatIssuedDate(token)}</span>
                </TableCell>
                <TableCell>
                  <TokenStatusBadge status={token.status} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {token.compliance.kycRequired && (
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">KYC</span>
                    )}
                    {token.compliance.accreditationRequired && (
                      <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">ACC</span>
                    )}
                    {token.compliance.permissionDexEnforced && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">PDX</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectToken(token)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {token.status === "ISSUED" && (
                        <DropdownMenuItem>
                          <Snowflake className="h-4 w-4 mr-2" />
                          Freeze Token
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Explorer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
