import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileCheck, Clock, CheckCircle, XCircle, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockChecks } from "@/data/mockChecks";
import { format, isPast } from "date-fns";
import { CheckStatus } from "@/types/check";

const statusConfig: Record<CheckStatus, { label: string; icon: typeof Clock; className: string }> = {
  PENDING: { label: "Pending", icon: Clock, className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  CASHED: { label: "Cashed", icon: CheckCircle, className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", icon: XCircle, className: "bg-muted text-muted-foreground" },
  EXPIRED: { label: "Expired", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function ChecksDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CheckStatus>("all");

  const filteredChecks = mockChecks.filter((check) => {
    const matchesSearch = check.destinationName?.toLowerCase().includes(search.toLowerCase()) ||
      check.senderName?.toLowerCase().includes(search.toLowerCase()) ||
      check.checkId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || check.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockChecks.length,
    pending: mockChecks.filter((c) => c.status === "PENDING").length,
    totalValue: mockChecks.filter((c) => c.status === "PENDING").reduce((sum, c) => sum + c.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search checks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="CASHED">Cashed</TabsTrigger>
            <TabsTrigger value="EXPIRED">Expired</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destination</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChecks.map((check) => {
                const config = statusConfig[check.status];
                const isExpired = check.expiration && isPast(new Date(check.expiration));
                return (
                  <TableRow key={check.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/checks/${check.id}`)}>
                    <TableCell>
                      <p className="font-medium">{check.destinationName || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{check.destination.slice(0, 12)}...</p>
                    </TableCell>
                    <TableCell className="font-medium">{check.amount.toLocaleString()}</TableCell>
                    <TableCell>{check.currency}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={config.className}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(check.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className={isExpired ? "text-destructive" : "text-muted-foreground"}>
                      {check.expiration ? format(new Date(check.expiration), "MMM d, yyyy") : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
