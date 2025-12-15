import { useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { TransactionBatch, BatchStatus, batchableTxTypeLabels, atomicityModeLabels, canSubmitBatch } from "@/types/batchTransaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ExternalLink, Play, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface BatchDetailsProps {
  batch: TransactionBatch;
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

const txStatusIcons = {
  PENDING: <Clock className="h-4 w-4 text-muted-foreground" />,
  SUCCESS: <CheckCircle className="h-4 w-4 text-green-600" />,
  FAILED: <XCircle className="h-4 w-4 text-destructive" />,
  SKIPPED: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
};

const BatchDetails = ({ batch, role }: BatchDetailsProps) => {
  const navigate = useNavigate();

  const successRate = batch.transactions.length > 0
    ? (batch.successCount / batch.transactions.length) * 100
    : 0;

  const handleSubmit = () => {
    toast({
      title: "Batch submitted",
      description: `${batch.name} has been submitted for execution`
    });
  };

  const handleDelete = () => {
    toast({
      title: "Batch deleted",
      description: `${batch.name} has been deleted`,
      variant: "destructive"
    });
    navigate("/batch");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/batch")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{batch.name}</h1>
            <Badge className={statusColors[batch.status]}>{batch.status}</Badge>
            <Badge variant="secondary">{batch.network}</Badge>
          </div>
          {batch.description && (
            <p className="text-muted-foreground">{batch.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {(batch.status === "DRAFT" || batch.status === "READY") && canSubmitBatch(role) && (
            <Button onClick={handleSubmit}>
              <Play className="h-4 w-4 mr-2" />
              Submit Batch
            </Button>
          )}
          {batch.status === "DRAFT" && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atomicity Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{atomicityModeLabels[batch.atomicityMode]}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {batch.atomicityMode === "ALL_OR_NOTHING" && "All succeed or all rollback"}
              {batch.atomicityMode === "UNTIL_FAILURE" && "Execute until first failure"}
              {batch.atomicityMode === "ONLY_ONE" && "Only first success applies"}
              {batch.atomicityMode === "INDEPENDENT" && "Each runs independently"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batch.transactions.length}</div>
            <p className="text-xs text-muted-foreground">in this batch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(0)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{format(new Date(batch.createdAt), "MMM d, yyyy")}</div>
            <p className="text-xs text-muted-foreground">{batch.createdBy}</p>
          </CardContent>
        </Card>
      </div>

      {batch.outerTxHash && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outer Transaction Hash</p>
                <code className="text-sm">{batch.outerTxHash}</code>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://testnet.xrpl.org/transactions/${batch.outerTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transaction Sequence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {batch.transactions.map((tx, index) => (
              <div
                key={tx.id}
                className="flex items-start gap-4 p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-8 h-8 p-0 flex items-center justify-center text-lg">
                    {tx.order}
                  </Badge>
                  {txStatusIcons[tx.status]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{batchableTxTypeLabels[tx.txType]}</span>
                    <Badge variant={tx.status === "SUCCESS" ? "default" : tx.status === "FAILED" ? "destructive" : "secondary"}>
                      {tx.status}
                    </Badge>
                  </div>
                  {Object.keys(tx.params).length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {Object.entries(tx.params).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                  {tx.resultMessage && (
                    <p className={`text-sm mt-2 ${tx.status === "FAILED" ? "text-destructive" : "text-muted-foreground"}`}>
                      {tx.resultMessage}
                    </p>
                  )}
                </div>
                {tx.innerTxHash && (
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`https://testnet.xrpl.org/transactions/${tx.innerTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {batch.submittedAt && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(batch.createdAt), "MMM d, yyyy HH:mm")} by {batch.createdBy}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium">Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(batch.submittedAt), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
              </div>
              {batch.completedAt && (
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    batch.status === "COMPLETED" ? "bg-green-500" :
                    batch.status === "PARTIAL" ? "bg-orange-500" : "bg-destructive"
                  }`} />
                  <div>
                    <p className="font-medium">
                      {batch.status === "COMPLETED" ? "Completed" :
                       batch.status === "PARTIAL" ? "Partially Completed" : "Failed"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(batch.completedAt), "MMM d, yyyy HH:mm")} — 
                      {batch.successCount} succeeded, {batch.failedCount} failed
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchDetails;
