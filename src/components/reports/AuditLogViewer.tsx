import React, { useState, useMemo } from "react";
import { Role } from "@/types/tokenization";
import { UnifiedAuditEntry, AuditEntityType, AuditAction, AuditSeverity } from "@/types/reportsAndLogs";
import { mockAuditEntries } from "@/data/mockReportsLogs";
import { mockBusinesses } from "@/data/mockBusinesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AuditLogDrawer } from "./AuditLogDrawer";
import { ExportReasonModal } from "./ExportReasonModal";
import { 
  Search, 
  Download, 
  Filter,
  ExternalLink,
  ChevronRight,
  CalendarIcon,
  Building2,
  Wallet,
  User,
  FileText,
  AlertTriangle,
  Info,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuditLogViewerProps {
  role: Role;
}

const entityTypes: AuditEntityType[] = [
  "PROJECT", "TOKEN", "WALLET", "ESCROW", "INVESTOR", 
  "REPORT", "TAX_PROFILE", "CHECK", "PAYMENT_CHANNEL", "CONTRACT", "BATCH",
  "BUSINESS", "WORK_ORDER", "CONTRACT_CALL", "MULTI_SIGN_TX", "HOLDER_AUTH"
];

const actionTypes: AuditAction[] = [
  "CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT",
  "LIFECYCLE_TRANSITION", "MINT", "BURN", "FREEZE", "UNFREEZE",
  "CLAWBACK", "DISTRIBUTE", "SIGN", "APPROVE", "REJECT",
  "LOCK", "UNLOCK", "AUTHORIZE", "REVOKE",
  "CALL", "SUBMIT", "EXECUTE", "ASSIGN", "COMPLETE", "PAY"
];

const severityLevels: AuditSeverity[] = ["INFO", "WARN", "HIGH"];

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ role }) => {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [businessFilter, setBusinessFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedEntry, setSelectedEntry] = useState<UnifiedAuditEntry | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [activeTab, setActiveTab] = useState("all");

  const filteredEntries = useMemo(() => {
    return mockAuditEntries
      .filter((entry) => {
        const matchesSearch = 
          search === "" ||
          entry.entityName?.toLowerCase().includes(search.toLowerCase()) ||
          entry.actorName.toLowerCase().includes(search.toLowerCase()) ||
          entry.entityId.toLowerCase().includes(search.toLowerCase()) ||
          entry.xrplTxHash?.toLowerCase().includes(search.toLowerCase()) ||
          entry.walletAddress?.toLowerCase().includes(search.toLowerCase());
        
        const matchesEntity = entityFilter === "all" || entry.entityType === entityFilter;
        const matchesAction = actionFilter === "all" || entry.action === actionFilter;
        const matchesSeverity = severityFilter === "all" || entry.severity === severityFilter;
        const matchesBusiness = businessFilter === "all" || entry.linkedBusinessId === businessFilter;
        
        // Date filters
        const entryDate = new Date(entry.createdAt);
        const matchesDateFrom = !dateFrom || entryDate >= dateFrom;
        const matchesDateTo = !dateTo || entryDate <= dateTo;

        // Tab filters
        let matchesTab = true;
        if (activeTab === "business") {
          matchesTab = entry.entityType === "BUSINESS" || !!entry.linkedBusinessId;
        } else if (activeTab === "workorder") {
          matchesTab = entry.entityType === "WORK_ORDER" || !!entry.linkedWorkOrderId;
        } else if (activeTab === "xrpl") {
          matchesTab = !!entry.xrplTxHash || !!entry.walletAddress;
        }
        
        return matchesSearch && matchesEntity && matchesAction && matchesSeverity && 
               matchesBusiness && matchesDateFrom && matchesDateTo && matchesTab;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [search, entityFilter, actionFilter, severityFilter, businessFilter, dateFrom, dateTo, activeTab]);

  const handleExport = (format: "csv" | "json") => {
    setExportFormat(format);
    setExportModalOpen(true);
  };

  const handleExportConfirm = (reason: string) => {
    toast.success(`Exporting ${filteredEntries.length} entries as ${exportFormat.toUpperCase()}`, {
      description: `Reason: ${reason}`
    });
    setExportModalOpen(false);
  };

  const getActionBadgeVariant = (action: AuditAction) => {
    switch (action) {
      case "CREATE":
      case "MINT":
      case "DISTRIBUTE":
      case "COMPLETE":
      case "PAY":
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

  const getSeverityIcon = (severity?: AuditSeverity) => {
    switch (severity) {
      case "HIGH":
        return <AlertCircle className="w-3.5 h-3.5 text-destructive" />;
      case "WARN":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const clearFilters = () => {
    setSearch("");
    setEntityFilter("all");
    setActionFilter("all");
    setSeverityFilter("all");
    setBusinessFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="business" className="gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Business
          </TabsTrigger>
          <TabsTrigger value="workorder" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="xrpl" className="gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            XRPL Activity
          </TabsTrigger>
        </TabsList>

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
                  placeholder="Search by entity, actor, TX hash, or wallet..."
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
                <SelectTrigger className="w-[140px]">
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
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  {severityLevels.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={businessFilter} onValueChange={setBusinessFilter}>
                <SelectTrigger className="w-[160px]">
                  <Building2 className="w-3.5 h-3.5 mr-2" />
                  <SelectValue placeholder="Business" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Businesses</SelectItem>
                  {mockBusinesses.map((biz) => (
                    <SelectItem key={biz.id} value={biz.id}>{biz.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("gap-1.5", !dateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("gap-1.5", !dateTo && "text-muted-foreground")}>
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {dateTo ? format(dateTo, "MMM d, yyyy") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {(search || entityFilter !== "all" || actionFilter !== "all" || severityFilter !== "all" || businessFilter !== "all" || dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="w-[140px]">Timestamp</TableHead>
                    <TableHead className="w-[100px]">Entity</TableHead>
                    <TableHead>Entity Name</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead className="w-[120px]">Links</TableHead>
                    <TableHead className="w-[100px]">XRPL TX</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                        <TableCell className="text-center">
                          {getSeverityIcon(entry.severity)}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {format(new Date(entry.createdAt), "MMM d, HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {entry.entityType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          <div>
                            {entry.entityName || entry.entityId}
                            {entry.walletAddress && (
                              <div className="text-xs text-muted-foreground font-mono">
                                {entry.walletAddress.slice(0, 8)}...{entry.walletAddress.slice(-6)}
                              </div>
                            )}
                          </div>
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
                          <div className="flex items-center gap-1">
                            {entry.linkedBusinessId && (
                              <Badge variant="outline" className="text-[9px] gap-0.5">
                                <Building2 className="w-2.5 h-2.5" />
                                BIZ
                              </Badge>
                            )}
                            {entry.linkedInvestorId && (
                              <Badge variant="outline" className="text-[9px] gap-0.5">
                                <User className="w-2.5 h-2.5" />
                                USR
                              </Badge>
                            )}
                            {entry.linkedWalletId && (
                              <Badge variant="outline" className="text-[9px] gap-0.5">
                                <Wallet className="w-2.5 h-2.5" />
                                WAL
                              </Badge>
                            )}
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
      </Tabs>

      <AuditLogDrawer 
        entry={selectedEntry} 
        onClose={() => setSelectedEntry(null)} 
      />

      <ExportReasonModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        title="Export Audit Log"
        description={`You are about to export ${filteredEntries.length} audit entries. Please provide a reason for this export.`}
      />
    </>
  );
};
