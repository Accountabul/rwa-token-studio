import React, { useState } from "react";
import { Role } from "@/types/tokenization";
import { reportDefinitions, ReportType, ReportOutputFormat, rolePermissionsMatrix } from "@/types/reportsAndLogs";
import { mockReportRuns } from "@/data/mockReportsLogs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Play, 
  FileText, 
  Clock,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ReportsLibraryProps {
  role: Role;
}

export const ReportsLibrary: React.FC<ReportsLibraryProps> = ({ role }) => {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [outputFormat, setOutputFormat] = useState<ReportOutputFormat>("CSV");

  const permissions = rolePermissionsMatrix[role];
  
  const availableReports = reportDefinitions.filter(
    (report) => report.requiredRoles.includes(role)
  );

  const internalReports = availableReports.filter(r => r.category === "INTERNAL");
  const taxReports = availableReports.filter(r => r.category === "TAX");

  const handleRunReport = async () => {
    if (!selectedReport) return;
    
    setIsRunning(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRunning(false);
    setSelectedReport(null);
    toast.success("Report generated successfully", {
      description: "Your report is ready for download."
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "RUNNING":
        return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Reports</TabsTrigger>
          <TabsTrigger value="history">Run History</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {/* Internal Reports */}
          {internalReports.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Internal Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {internalReports.map((report) => (
                  <Card 
                    key={report.type} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedReport(report.type)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {report.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-medium mt-3">
                        {report.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {report.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report.type);
                        }}
                      >
                        <Play className="w-3.5 h-3.5" />
                        Run Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tax Reports */}
          {taxReports.length > 0 && permissions.exportTaxData && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Tax Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taxReports.map((report) => (
                  <Card 
                    key={report.type} 
                    className="hover:shadow-md transition-shadow cursor-pointer border-amber-500/20"
                    onClick={() => setSelectedReport(report.type)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">
                          TAX
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-medium mt-3">
                        {report.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {report.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report.type);
                        }}
                      >
                        <Play className="w-3.5 h-3.5" />
                        Run Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {availableReports.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reports available for your role.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Recent Report Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Report</TableHead>
                      <TableHead>Generated By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[80px]">Format</TableHead>
                      <TableHead className="w-[80px]">Rows</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReportRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium text-sm">
                          {run.reportName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {run.generatedByName}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {format(new Date(run.generatedAt), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {run.outputFormat}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {run.rowCount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(run.status)}
                            <span className="text-xs">{run.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {run.status === "COMPLETED" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1.5 h-7"
                              onClick={() => toast.success("Downloading report...")}
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Run Report Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Report</DialogTitle>
            <DialogDescription>
              Configure parameters and generate the report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Input 
                value={reportDefinitions.find(r => r.type === selectedReport)?.name || ""} 
                disabled 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as ReportOutputFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="PDF" disabled>PDF (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Cancel
            </Button>
            <Button onClick={handleRunReport} disabled={isRunning} className="gap-2">
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
