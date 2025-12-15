import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { SmartContract, ContractStatus, canCallContract, canPauseContract, canDeleteContract } from "@/types/smartContract";
import { mockContractCalls } from "@/data/mockContracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink, Play, Pause, Trash2, Copy, Check, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import ContractCallDialog from "./ContractCallDialog";

interface ContractDetailsProps {
  contract: SmartContract;
  role: Role;
}

const statusColors: Record<ContractStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  DEPLOYING: "bg-yellow-500/20 text-yellow-600",
  ACTIVE: "bg-green-500/20 text-green-600",
  PAUSED: "bg-orange-500/20 text-orange-600",
  DELETED: "bg-destructive/20 text-destructive",
};

const ContractDetails = ({ contract, role }: ContractDetailsProps) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<typeof contract.functions[0] | null>(null);

  const contractCalls = mockContractCalls.filter(c => c.contractId === contract.id);

  const copyAddress = () => {
    navigator.clipboard.writeText(contract.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCallFunction = (fn: typeof contract.functions[0]) => {
    setSelectedFunction(fn);
    setCallDialogOpen(true);
  };

  const handlePauseResume = () => {
    toast({
      title: contract.status === "PAUSED" ? "Contract resumed" : "Contract paused",
      description: `${contract.name} has been ${contract.status === "PAUSED" ? "resumed" : "paused"}`
    });
  };

  const handleDelete = () => {
    toast({
      title: "Contract deleted",
      description: `${contract.name} has been marked for deletion`,
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/contracts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{contract.name}</h1>
            <Badge className={statusColors[contract.status]}>{contract.status}</Badge>
            <Badge variant="secondary">{contract.network}</Badge>
          </div>
          <p className="text-muted-foreground">{contract.description}</p>
        </div>
        <div className="flex gap-2">
          {canPauseContract(role) && contract.status !== "DRAFT" && (
            <Button variant="outline" onClick={handlePauseResume}>
              {contract.status === "PAUSED" ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          )}
          {canDeleteContract(role) && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contract Address</CardTitle>
          </CardHeader>
          <CardContent>
            {contract.contractAddress ? (
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {contract.contractAddress.slice(0, 12)}...{contract.contractAddress.slice(-4)}
                </code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                  <a href={`https://testnet.xrpl.org/accounts/${contract.contractAddress}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            ) : (
              <span className="text-muted-foreground">Not deployed</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.totalCalls.toLocaleString()}</div>
            {contract.lastCallAt && (
              <p className="text-xs text-muted-foreground">
                Last: {format(new Date(contract.lastCallAt), "MMM d, HH:mm")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">WASM Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(contract.wasmSize / 1024).toFixed(1)} KB</div>
            <p className="text-xs text-muted-foreground">
              {((contract.wasmSize / (64 * 1024)) * 100).toFixed(0)}% of limit
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="functions">
        <TabsList>
          <TabsTrigger value="functions">Functions ({contract.functions.length})</TabsTrigger>
          <TabsTrigger value="calls">Recent Calls ({contractCalls.length})</TabsTrigger>
          <TabsTrigger value="params">Instance Params</TabsTrigger>
        </TabsList>

        <TabsContent value="functions" className="mt-4">
          <div className="grid gap-3">
            {contract.functions.map((fn, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="font-medium">{fn.name}()</code>
                        {fn.returnType && (
                          <Badge variant="outline">→ {fn.returnType}</Badge>
                        )}
                      </div>
                      {fn.description && (
                        <p className="text-sm text-muted-foreground mt-1">{fn.description}</p>
                      )}
                      {fn.parameters.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {fn.parameters.map((p, i) => (
                            <div key={i} className="text-sm">
                              <code className="text-primary">{p.name}</code>
                              <span className="text-muted-foreground">: {p.type}</span>
                              {p.required && <span className="text-destructive"> *</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      {fn.flags && fn.flags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {fn.flags.map((flag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{flag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {canCallContract(role) && contract.status === "ACTIVE" && (
                      <Button size="sm" onClick={() => handleCallFunction(fn)}>
                        <Play className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calls" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Function</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Tx Hash</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractCalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No calls recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  contractCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        <code className="text-sm">{call.functionName}()</code>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {call.caller.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge className={call.result === "SUCCESS" ? "bg-green-500/20 text-green-600" : "bg-destructive/20 text-destructive"}>
                          {call.result}
                        </Badge>
                        {call.errorMessage && (
                          <div className="text-xs text-destructive mt-1">{call.errorMessage}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://testnet.xrpl.org/transactions/${call.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <code className="text-xs">{call.txHash.slice(0, 8)}...</code>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(call.timestamp), "MMM d, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="params" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {contract.instanceParams.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No instance parameters</p>
              ) : (
                <div className="space-y-3">
                  {contract.instanceParams.map((param, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="font-medium">{param.name}</code>
                          <Badge variant="outline">{param.type}</Badge>
                          {param.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        {param.description && (
                          <p className="text-sm text-muted-foreground mt-1">{param.description}</p>
                        )}
                      </div>
                      {param.defaultValue && (
                        <code className="text-sm bg-background px-2 py-1 rounded">
                          {param.defaultValue}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ContractCallDialog
        open={callDialogOpen}
        onOpenChange={setCallDialogOpen}
        contractName={contract.name}
        func={selectedFunction}
      />
    </div>
  );
};

export default ContractDetails;
