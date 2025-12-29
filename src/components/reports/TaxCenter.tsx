import React, { useState, useMemo } from "react";
import { Role } from "@/types/tokenization";
import { TaxProfile, TaxFormStatus, rolePermissionsMatrix } from "@/types/reportsAndLogs";
import { mockTaxProfiles, mockLedgerEntries, ExtendedMockTaxProfile } from "@/data/mockReportsLogs";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Download, 
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileWarning,
  Building2,
  User,
  Globe,
  Shield,
  DollarSign,
  Users,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { ExportReasonModal } from "./ExportReasonModal";

interface TaxCenterProps {
  role: Role;
}

export const TaxCenter: React.FC<TaxCenterProps> = ({ role }) => {
  const [search, setSearch] = useState("");
  const [w9Filter, setW9Filter] = useState<string>("all");
  const [payeeCategoryFilter, setPayeeCategoryFilter] = useState<string>("all");
  const [residencyFilter, setResidencyFilter] = useState<string>("all");
  const [businessFilter, setBusinessFilter] = useState<string>("all");
  const [selectedProfile, setSelectedProfile] = useState<TaxProfile | null>(null);
  const [taxYear, setTaxYear] = useState<string>("2024");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportContext, setExportContext] = useState<{ type: string; count: number }>({ type: "", count: 0 });
  
  const permissions = rolePermissionsMatrix[role];

  const filteredProfiles = useMemo(() => {
    return (mockTaxProfiles as ExtendedMockTaxProfile[]).filter((profile) => {
      const matchesSearch = 
        search === "" ||
        profile.userName.toLowerCase().includes(search.toLowerCase()) ||
        profile.legalName.toLowerCase().includes(search.toLowerCase());
      
      const matchesW9 = w9Filter === "all" || profile.w9Status === w9Filter;
      const matchesCategory = payeeCategoryFilter === "all" || profile.payeeCategory === payeeCategoryFilter;
      const matchesResidency = residencyFilter === "all" || profile.residency === residencyFilter;
      
      return matchesSearch && matchesW9 && matchesCategory && matchesResidency;
    });
  }, [search, w9Filter, payeeCategoryFilter, residencyFilter]);

  const stats = useMemo(() => {
    const total = mockTaxProfiles.length;
    const verified = mockTaxProfiles.filter(p => p.w9Status === "VERIFIED" || p.w8Status === "VERIFIED").length;
    const missing = mockTaxProfiles.filter(p => p.w9Status === "MISSING" && p.w8Status === "MISSING").length;
    const withholding = mockTaxProfiles.filter(p => p.backupWithholdingRequired).length;
    const over600 = mockTaxProfiles.filter(p => p.totalPaymentsYTD >= 600).length;
    
    return { total, verified, missing, withholding, over600 };
  }, []);

  // Payout summaries computed from ledger entries
  const payoutSummaries = useMemo(() => {
    const payoutEntries = mockLedgerEntries.filter(e => 
      e.entryType === "PAYOUT" || e.entryType === "TOKEN_DISTRIBUTION"
    );

    // Group by payee
    const byPayee: Record<string, {
      payeeName: string;
      payeeId: string;
      category: string;
      totalPayouts: number;
      byRail: Record<string, number>;
      workOrderPayments: number;
      tokenDistributions: number;
    }> = {};

    payoutEntries.forEach(entry => {
      if (!byPayee[entry.payeeEntityId]) {
        const profile = mockTaxProfiles.find(p => p.userId === entry.payeeEntityId) as ExtendedMockTaxProfile | undefined;
        byPayee[entry.payeeEntityId] = {
          payeeName: entry.payeeName,
          payeeId: entry.payeeEntityId,
          category: profile?.payeeCategory ?? "UNKNOWN",
          totalPayouts: 0,
          byRail: {},
          workOrderPayments: 0,
          tokenDistributions: 0,
        };
      }
      
      const payee = byPayee[entry.payeeEntityId];
      payee.totalPayouts += entry.amount;
      payee.byRail[entry.rail] = (payee.byRail[entry.rail] || 0) + entry.amount;
      
      if (entry.linkedWorkOrderId) {
        payee.workOrderPayments += entry.amount;
      }
      if (entry.entryType === "TOKEN_DISTRIBUTION") {
        payee.tokenDistributions += entry.amount;
      }
    });

    return Object.values(byPayee).sort((a, b) => b.totalPayouts - a.totalPayouts);
  }, []);

  const payoutStats = useMemo(() => {
    const totalPayouts = payoutSummaries.reduce((sum, p) => sum + p.totalPayouts, 0);
    const workOrderTotal = payoutSummaries.reduce((sum, p) => sum + p.workOrderPayments, 0);
    const tokenTotal = payoutSummaries.reduce((sum, p) => sum + p.tokenDistributions, 0);
    const over600Count = payoutSummaries.filter(p => p.totalPayouts >= 600).length;
    
    return { totalPayouts, workOrderTotal, tokenTotal, over600Count };
  }, [payoutSummaries]);

  const getStatusIcon = (status: TaxFormStatus) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "COLLECTED":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "MISSING":
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      case "REJECTED":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "EXPIRED":
        return <FileWarning className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: TaxFormStatus) => {
    switch (status) {
      case "VERIFIED": return "default";
      case "COLLECTED": return "secondary";
      case "MISSING": return "outline";
      case "REJECTED": return "destructive";
      case "EXPIRED": return "secondary";
      default: return "outline";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleViewProfile = (profile: TaxProfile) => {
    setSelectedProfile(profile);
    toast.info("Tax profile access logged", {
      description: `Viewing ${profile.userName}'s tax profile`
    });
  };

  const handleExport = (type: string, count: number) => {
    setExportContext({ type, count });
    setExportModalOpen(true);
  };

  const handleExportConfirm = (reason: string) => {
    toast.success(`Exporting ${exportContext.type}...`, {
      description: `Reason: ${reason}`
    });
    setExportModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-primary">{stats.verified}</p>
            <p className="text-xs text-muted-foreground mt-1">Verified</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-destructive">{stats.missing}</p>
            <p className="text-xs text-muted-foreground mt-1">Missing Forms</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-amber-600">{stats.withholding}</p>
            <p className="text-xs text-muted-foreground mt-1">Backup Withholding</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.over600}</p>
            <p className="text-xs text-muted-foreground mt-1">≥$600 YTD</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profiles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profiles">Tax Profiles</TabsTrigger>
          <TabsTrigger value="payouts">Payout Summaries</TabsTrigger>
          <TabsTrigger value="1099">1099 Preparation</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Tax Profiles</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5"
                  onClick={() => handleExport("Tax Profiles", filteredProfiles.length)}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={w9Filter} onValueChange={setW9Filter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="W-9 Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="COLLECTED">Collected</SelectItem>
                    <SelectItem value="MISSING">Missing</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={payeeCategoryFilter} onValueChange={setPayeeCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="WORKER">Worker</SelectItem>
                    <SelectItem value="VENDOR">Vendor</SelectItem>
                    <SelectItem value="BUSINESS_OWNER">Business Owner</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={residencyFilter} onValueChange={setResidencyFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Residency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="US">US</SelectItem>
                    <SelectItem value="NON_US">Non-US</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">W-9</TableHead>
                      <TableHead className="text-center">W-8</TableHead>
                      <TableHead className="text-right">YTD Payments</TableHead>
                      <TableHead className="text-center">Withholding</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.userId}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{profile.userName}</p>
                            <p className="text-xs text-muted-foreground">{profile.legalName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {profile.entityType.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {profile.payeeCategory && (
                            <Badge variant="secondary" className="text-[10px]">
                              {profile.payeeCategory.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {getStatusIcon(profile.w9Status)}
                            <span className="text-xs">{profile.w9Status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {getStatusIcon(profile.w8Status)}
                            <span className="text-xs">{profile.w8Status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {formatCurrency(profile.totalPaymentsYTD)}
                        </TableCell>
                        <TableCell className="text-center">
                          {profile.backupWithholdingRequired ? (
                            <Badge variant="destructive" className="text-[10px]">
                              24%
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7"
                            onClick={() => handleViewProfile(profile)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <div className="space-y-6">
            {/* Payout Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{formatCurrency(payoutStats.totalPayouts)}</p>
                      <p className="text-xs text-muted-foreground">Total Payouts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Briefcase className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{formatCurrency(payoutStats.workOrderTotal)}</p>
                      <p className="text-xs text-muted-foreground">Work Order Payments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Globe className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{payoutStats.tokenTotal.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Token Distributions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <Users className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{payoutStats.over600Count}</p>
                      <p className="text-xs text-muted-foreground">1099 Candidates (≥$600)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payout Table */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Payout Summaries by Payee</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={taxYear} onValueChange={setTaxYear}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5"
                      onClick={() => handleExport("Payout Summaries", payoutSummaries.length)}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Payee</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Total Payouts</TableHead>
                        <TableHead className="text-right">Work Orders</TableHead>
                        <TableHead className="text-right">Token Dist.</TableHead>
                        <TableHead className="text-center">$600+</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutSummaries.map((summary) => (
                        <TableRow key={summary.payeeId}>
                          <TableCell>
                            <p className="font-medium text-sm">{summary.payeeName}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {summary.category.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(summary.totalPayouts)}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {summary.workOrderPayments > 0 ? formatCurrency(summary.workOrderPayments) : "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {summary.tokenDistributions > 0 ? summary.tokenDistributions.toLocaleString() : "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {summary.totalPayouts >= 600 ? (
                              <Badge variant="default" className="text-[10px]">Yes</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">No</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="1099">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">1099-NEC Dataset</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Non-employee compensation for payees with $600+ in payments.
                </p>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-semibold">{stats.over600}</p>
                  <p className="text-xs text-muted-foreground mt-1">Eligible payees</p>
                </div>
                <Button className="w-full gap-2" onClick={() => handleExport("1099-NEC Dataset", stats.over600)}>
                  <Download className="w-4 h-4" />
                  Generate Dataset
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Missing Forms Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Payees requiring W-9 or W-8 collection before 1099 issuance.
                </p>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-2xl font-semibold text-destructive">{stats.missing}</p>
                  <p className="text-xs text-muted-foreground mt-1">Missing forms</p>
                </div>
                <Button variant="outline" className="w-full gap-2" onClick={() => handleExport("Missing Forms", stats.missing)}>
                  <FileWarning className="w-4 h-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Profile Detail Sheet */}
      <Sheet open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <SheetContent className="w-[450px] sm:max-w-[450px] overflow-y-auto">
          {selectedProfile && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {selectedProfile.entityType === "INDIVIDUAL" ? (
                      <User className="w-5 h-5 text-primary" />
                    ) : (
                      <Building2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-base font-medium">{selectedProfile.userName}</p>
                    <p className="text-xs text-muted-foreground font-normal">
                      {selectedProfile.entityType.replace(/_/g, " ")}
                    </p>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Legal Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Legal Information</h4>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Legal Name</span>
                      <span className="text-sm font-medium">{selectedProfile.legalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">US Person</span>
                      <span className="text-sm">{selectedProfile.isUsPerson ? "Yes" : "No"}</span>
                    </div>
                    {permissions.viewTaxIds && selectedProfile.tinLast4 && (
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">TIN (Last 4)</span>
                        <span className="text-sm font-mono">***-**-{selectedProfile.tinLast4}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Address */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Address
                  </h4>
                  <div className="p-4 rounded-lg bg-muted/50 text-sm">
                    {selectedProfile.addressJson.street && <p>{selectedProfile.addressJson.street}</p>}
                    <p>
                      {selectedProfile.addressJson.city && `${selectedProfile.addressJson.city}, `}
                      {selectedProfile.addressJson.state} {selectedProfile.addressJson.zip}
                    </p>
                    <p className="text-muted-foreground">{selectedProfile.addressJson.country}</p>
                  </div>
                </div>

                <Separator />

                {/* Tax Form Status */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Tax Form Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getStatusIcon(selectedProfile.w9Status)}
                        <span className="text-sm font-medium">W-9</span>
                      </div>
                      <Badge variant={getStatusBadgeVariant(selectedProfile.w9Status)}>
                        {selectedProfile.w9Status}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getStatusIcon(selectedProfile.w8Status)}
                        <span className="text-sm font-medium">W-8</span>
                      </div>
                      <Badge variant={getStatusBadgeVariant(selectedProfile.w8Status)}>
                        {selectedProfile.w8Status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Financial Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Financial Summary</h4>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Total Payments YTD</span>
                      <span className="text-sm font-semibold">{formatCurrency(selectedProfile.totalPaymentsYTD)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">1099 Threshold</span>
                      <span className="text-sm">
                        {selectedProfile.totalPaymentsYTD >= 600 ? (
                          <Badge variant="default">Met ($600+)</Badge>
                        ) : (
                          <span className="text-muted-foreground">Not Met</span>
                        )}
                      </span>
                    </div>
                    {selectedProfile.backupWithholdingRequired && (
                      <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive font-medium">
                          Backup Withholding Required (24%)
                        </p>
                        {selectedProfile.backupWithholdingReason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedProfile.backupWithholdingReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Export Modal */}
      <ExportReasonModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onConfirm={handleExportConfirm}
        exportType="CSV"
        rowCount={exportContext.count}
        reportName={exportContext.type}
      />
    </div>
  );
};
