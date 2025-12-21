import React, { useState, useMemo } from "react";
import { Role } from "@/types/tokenization";
import { UnifiedAuditEntry, AuditEntityType, AuditAction } from "@/types/reportsAndLogs";
import { mockAuditEntries } from "@/data/mockReportsLogs";
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
import { AuditLogDrawer } from "./AuditLogDrawer";
import { 
  Search, 
  Download, 
  Filter,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AuditLogViewerProps {
  role: Role;
}

const entityTypes: AuditEntityType[] = [
  "PROJECT", "TOKEN", "WALLET", "ESCROW", "INVESTOR", 
  "REPORT", "TAX_PROFILE", "CHECK", "PAYMENT_CHANNEL", "CONTRACT", "BATCH"
];

const actionTypes: AuditAction[] = [
  "CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT",
  "LIFECYCLE_TRANSITION", "MINT", "BURN", "FREEZE", "UNFREEZE",
  "CLAWBACK", "DISTRIBUTE", "SIGN", "APPROVE", "REJECT",
  "LOCK", "UNLOCK", "AUTHORIZE", "REVOKE"
];

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ role }) => {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<UnifiedAuditEntry | null>(null);

  const filteredEntries = useMemo(() => {
    return mockAuditEntries
      .filter((entry) => {
        const matchesSearch = 
          search === "" ||
          entry.entityName?.toLowerCase().includes(search.toLowerCase()) ||
          entry.actorName.toLowerCase().includes(search.toLowerCase()) ||
          entry.entityId.toLowerCase().includes(search.toLowerCase()) ||
          entry.xrplTxHash?.toLowerCase().includes(search.toLowerCase());
        
        const matchesEntity = entityFilter === "all" || entry.entityType === entityFilter;
        const matchesAction = actionFilter === "all" || entry.action === actionFilter;
        
        return matchesSearch && matchesEntity && matchesAction;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [search, entityFilter, actionFilter]);

  const handleExport = (format: "csv" | "json") => {
    toast.success(`Exporting ${filteredEntries.length} entries as ${format.toUpperCase()}`);
  };

  const getActionBadgeVariant = (action: AuditAction) => {
    switch (action) {
      case "CREATE":
      case "MINT":
      case "DISTRIBUTE":
        return "default";
      case "DELETE":
      case "BURN":
      case "CLAWBACK":
        return "destructive";
      case "FREEZE":
      case "LOCK":
        return "secondary";
      case "APPROVE":
        return "default";
      case "REJECT":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Audit Log</CardTitle>
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
                placeholder="Search by entity, actor, or TX hash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-3.5 h-3.5 mr-2" />
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-3.5 h-3.5 mr-2" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[160px]">Timestamp</TableHead>
                  <TableHead className="w-[100px]">Entity</TableHead>
                  <TableHead>Entity Name</TableHead>
                  <TableHead className="w-[120px]">Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead className="w-[100px]">XRPL TX</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No audit entries match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow 
                      key={entry.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {format(new Date(entry.createdAt), "MMM d, HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {entry.entityType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {entry.entityName || entry.entityId}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(entry.action)} className="text-[10px]">
                          {entry.action.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{entry.actorName}</span>
                          <span className="text-muted-foreground text-xs ml-1.5">
                            ({entry.actorRole.replace(/_/g, " ")})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.xrplTxHash ? (
                          <a
                            href={`https://livenet.xrpl.org/transactions/${entry.xrplTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="font-mono">
                              {entry.xrplTxHash.slice(0, 6)}...
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Entry count */}
          <div className="text-xs text-muted-foreground text-right">
            Showing {filteredEntries.length} of {mockAuditEntries.length} entries
          </div>
        </CardContent>
      </Card>

      <AuditLogDrawer 
        entry={selectedEntry} 
        onClose={() => setSelectedEntry(null)} 
      />
    </>
  );
};
