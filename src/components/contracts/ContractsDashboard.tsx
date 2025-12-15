import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { ContractStatus, canDeployContract } from "@/types/smartContract";
import { mockContracts } from "@/data/mockContracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Code, Plus, Activity, Zap, Clock } from "lucide-react";
import CreateContractDialog from "./CreateContractDialog";
import { format } from "date-fns";

interface ContractsDashboardProps {
  role: Role;
}

const statusColors: Record<ContractStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  DEPLOYING: "bg-yellow-500/20 text-yellow-600",
  ACTIVE: "bg-green-500/20 text-green-600",
  PAUSED: "bg-orange-500/20 text-orange-600",
  DELETED: "bg-destructive/20 text-destructive",
};

const ContractsDashboard = ({ role }: ContractsDashboardProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | ContractStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filteredContracts = filter === "all" 
    ? mockContracts 
    : mockContracts.filter(c => c.status === filter);

  const activeCount = mockContracts.filter(c => c.status === "ACTIVE").length;
  const totalCalls = mockContracts.reduce((sum, c) => sum + c.totalCalls, 0);
  const pausedCount = mockContracts.filter(c => c.status === "PAUSED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Smart Contracts</h1>
          <p className="text-muted-foreground">Deploy and manage XLS-101 WASM contracts</p>
        </div>
        {canDeployContract(role) && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Deploy Contract
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Deployed on-chain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time executions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pausedCount}</div>
            <p className="text-xs text-muted-foreground">Temporarily disabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockContracts.filter(c => c.status === "DRAFT").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending deployment</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({mockContracts.length})</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="PAUSED">Paused ({pausedCount})</TabsTrigger>
          <TabsTrigger value="DRAFT">
            Draft ({mockContracts.filter(c => c.status === "DRAFT").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Calls</TableHead>
              <TableHead>Last Call</TableHead>
              <TableHead>Network</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.map((contract) => (
              <TableRow
                key={contract.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/contracts/${contract.id}`)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{contract.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {contract.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{contract.template.replace(/_/g, " ")}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[contract.status]}>
                    {contract.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {contract.contractAddress 
                    ? `${contract.contractAddress.slice(0, 8)}...${contract.contractAddress.slice(-4)}`
                    : "—"
                  }
                </TableCell>
                <TableCell>{contract.totalCalls.toLocaleString()}</TableCell>
                <TableCell>
                  {contract.lastCallAt 
                    ? format(new Date(contract.lastCallAt), "MMM d, HH:mm")
                    : "—"
                  }
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{contract.network}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <CreateContractDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};

export default ContractsDashboard;
