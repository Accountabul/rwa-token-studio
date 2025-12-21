import React, { useState, useMemo } from "react";
import { Role } from "@/types/tokenization";
import { TransactionLedgerEntry, LedgerRail, LedgerStatus, LedgerEntryType } from "@/types/reportsAndLogs";
import { mockLedgerEntries } from "@/data/mockReportsLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Download, 
  Filter,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface TransactionLedgerProps {
  role: Role;
}

const rails: LedgerRail[] = ["XRPL", "STRIPE", "PAYPAL", "ACH", "WIRE", "INTERNAL"];
const statuses: LedgerStatus[] = ["PENDING", "SETTLED", "FAILED", "REVERSED"];

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({ role }) => {
  const [search, setSearch] = useState("");
  const [railFilter, setRailFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredEntries = useMemo(() => {
    return mockLedgerEntries
      .filter((entry) => {
        const matchesSearch = 
          search === "" ||
          entry.payerName.toLowerCase().includes(search.toLowerCase()) ||
          entry.payeeName.toLowerCase().includes(search.toLowerCase()) ||
          entry.memo?.toLowerCase().includes(search.toLowerCase()) ||
          entry.xrplTxHash?.toLowerCase().includes(search.toLowerCase()) ||
          entry.processorRef?.toLowerCase().includes(search.toLowerCase());
        
        const matchesRail = railFilter === "all" || entry.rail === railFilter;
        const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
        
        return matchesSearch && matchesRail && matchesStatus;
      })
      .sort((a, b) => new Date(b.effectiveAt).getTime() - new Date(a.effectiveAt).getTime());
  }, [search, railFilter, statusFilter]);

  const totals = useMemo(() => {
    const byStatus = {
      settled: filteredEntries.filter(e => e.status === "SETTLED" && e.currency === "USD").reduce((sum, e) => sum + e.amount, 0),
      pending: filteredEntries.filter(e => e.status === "PENDING" && e.currency === "USD").reduce((sum, e) => sum + e.amount, 0),
      failed: filteredEntries.filter(e => e.status === "FAILED" && e.currency === "USD").reduce((sum, e) => sum + e.amount, 0),
    };
    return byStatus;
  }, [filteredEntries]);

  const handleExport = (format: "csv" | "json") => {
    toast.success(`Exporting ${filteredEntries.length} ledger entries as ${format.toUpperCase()}`);
  };

  const getStatusBadgeVariant = (status: LedgerStatus) => {
    switch (status) {
      case "SETTLED": return "default";
      case "PENDING": return "secondary";
      case "FAILED": return "destructive";
      case "REVERSED": return "outline";
      default: return "outline";
    }
  };

  const getRailBadgeColor = (rail: LedgerRail) => {
    switch (rail) {
      case "XRPL": return "bg-primary/10 text-primary border-primary/20";
      case "STRIPE": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "PAYPAL": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "ACH": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "WIRE": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "INTERNAL": return "bg-muted text-muted-foreground border-muted";
      default: return "";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Settled (USD)</p>
                <p className="text-xl font-semibold text-foreground mt-1">
                  {formatCurrency(totals.settled, "USD")}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending (USD)</p>
                <p className="text-xl font-semibold text-foreground mt-1">
                  {formatCurrency(totals.pending, "USD")}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Failed (USD)</p>
                <p className="text-xl font-semibold text-foreground mt-1">
                  {formatCurrency(totals.failed, "USD")}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Transaction Ledger</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport("csv")}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport("json")}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by payer, payee, memo, or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={railFilter} onValueChange={setRailFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-3.5 h-3.5 mr-2" />
                <SelectValue placeholder="Rail" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rails</SelectItem>
                {rails.map((rail) => (
                  <SelectItem key={rail} value={rail}>{rail}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-3.5 h-3.5 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[140px]">Date</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="text-right w-[120px]">Amount</TableHead>
                  <TableHead className="w-[80px]">Rail</TableHead>
                  <TableHead className="w-[90px]">Status</TableHead>
                  <TableHead>From → To</TableHead>
                  <TableHead className="w-[100px]">Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No ledger entries match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {format(new Date(entry.effectiveAt), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {entry.entryType.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {formatCurrency(entry.amount, entry.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${getRailBadgeColor(entry.rail)}`}>
                          {entry.rail}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(entry.status)} className="text-[10px]">
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <span className="text-muted-foreground">{entry.payerName}</span>
                          <span className="mx-1.5">→</span>
                          <span className="font-medium">{entry.payeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.xrplTxHash ? (
                          <a
                            href={`https://livenet.xrpl.org/transactions/${entry.xrplTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                          >
                            <span className="font-mono">{entry.xrplTxHash.slice(0, 6)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : entry.processorRef ? (
                          <span className="text-xs font-mono text-muted-foreground">
                            {entry.processorRef.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Entry count */}
          <div className="text-xs text-muted-foreground text-right">
            Showing {filteredEntries.length} of {mockLedgerEntries.length} entries
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
