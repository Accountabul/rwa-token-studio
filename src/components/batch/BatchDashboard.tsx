import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { BatchStatus, canCreateBatch } from "@/types/batchTransaction";
import { mockBatches } from "@/data/mockBatches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Plus, CheckCircle, AlertCircle, Clock, FileEdit } from "lucide-react";
import { format } from "date-fns";

interface BatchDashboardProps {
  role: Role;
}

const statusColors: Record<BatchStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  READY: "bg-blue-500/20 text-blue-600",
  SUBMITTED: "bg-yellow-500/20 text-yellow-600",
  COMPLETED: "bg-green-500/20 text-green-600",
  PARTIAL: "bg-orange-500/20 text-orange-600",
  FAILED: "bg-destructive/20 text-destructive",
};

const BatchDashboard = ({ role }: BatchDashboardProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | BatchStatus>("all");

  const filteredBatches = filter === "all"
    ? mockBatches
    : mockBatches.filter(b => b.status === filter);

  const draftCount = mockBatches.filter(b => b.status === "DRAFT" || b.status === "READY").length;
  const completedCount = mockBatches.filter(b => b.status === "COMPLETED").length;
  const partialCount = mockBatches.filter(b => b.status === "PARTIAL").length;

  const totalTx = mockBatches.reduce((sum, b) => sum + b.transactions.length, 0);
  const successTx = mockBatches.reduce((sum, b) => sum + b.successCount, 0);
  const successRate = totalTx > 0 ? ((successTx / totalTx) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batch Transactions</h1>
          <p className="text-muted-foreground">Build and submit XLS-56 transaction batches</p>
        </div>
        {canCreateBatch(role) && (
          <Button onClick={() => navigate("/batch/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Batch
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts & Ready</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">Pending submission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Fully executed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Partial</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partialCount}</div>
            <p className="text-xs text-muted-foreground">Some failures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">{successTx}/{totalTx} transactions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({mockBatches.length})</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="READY">Ready</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed ({completedCount})</TabsTrigger>
          <TabsTrigger value="PARTIAL">Partial ({partialCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Success</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Network</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.map((batch) => (
              <TableRow
                key={batch.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/batch/${batch.id}`)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{batch.name}</div>
                    {batch.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {batch.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {batch.atomicityMode.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[batch.status]}>
                    {batch.status}
                  </Badge>
                </TableCell>
                <TableCell>{batch.transactions.length}</TableCell>
                <TableCell>
                  {batch.successCount > 0 || batch.failedCount > 0 ? (
                    <span className={batch.failedCount > 0 ? "text-orange-600" : "text-green-600"}>
                      {batch.successCount}/{batch.transactions.length}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(batch.createdAt), "MMM d, HH:mm")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{batch.network}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default BatchDashboard;
