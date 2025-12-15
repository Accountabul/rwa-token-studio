import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Droplets, TrendingUp, Percent, Clock, Plus, Minus, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockAMMPools, mockAMMTransactions, mockLPPositions } from "@/data/mockAMMPools";
import { ExplorerLinkBadge } from "@/components/tokens/ExplorerLinkBadge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PoolDetailsPage() {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const pool = mockAMMPools.find((p) => p.id === poolId);
  const transactions = mockAMMTransactions.filter((t) => t.poolId === poolId);
  const positions = mockLPPositions.filter((p) => p.poolId === poolId);

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [asset1Amount, setAsset1Amount] = useState("");
  const [asset2Amount, setAsset2Amount] = useState("");

  if (!pool) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold">Pool not found</h1>
          <Button onClick={() => navigate("/amm")} className="mt-4">
            Back to AMM Pools
          </Button>
        </div>
      </div>
    );
  }

  const formatAsset = (currency: string, issuer?: string) => {
    if (currency === "XRP") return "XRP";
    return `${currency}${issuer ? ` (${issuer.slice(0, 6)}...)` : ""}`;
  };

  const handleDeposit = () => {
    toast({
      title: "Liquidity Added",
      description: `Successfully deposited liquidity to ${pool.asset1.currency}/${pool.asset2.currency} pool`,
    });
    setDepositOpen(false);
    setAsset1Amount("");
    setAsset2Amount("");
  };

  const handleWithdraw = () => {
    toast({
      title: "Liquidity Removed",
      description: `Successfully withdrew liquidity from ${pool.asset1.currency}/${pool.asset2.currency} pool`,
    });
    setWithdrawOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/amm")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {pool.asset1.currency} / {pool.asset2.currency}
            </h1>
            <p className="text-sm text-muted-foreground">AMM Liquidity Pool</p>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            {pool.apy.toFixed(1)}% APY
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Value Locked</p>
              <p className="text-2xl font-bold">${pool.totalValueLockedUsd.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">24h Volume</p>
              <p className="text-2xl font-bold">${pool.volume24hUsd.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Trading Fee</p>
              <p className="text-2xl font-bold">{(pool.tradingFee * 100).toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">LP Token Supply</p>
              <p className="text-2xl font-bold">{pool.lpTokenSupply.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pool Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Pool Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">{pool.asset1.currency}</p>
                <p className="text-3xl font-bold">{pool.asset1.amount.toLocaleString()}</p>
                {pool.asset1.issuer && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{pool.asset1.issuer.slice(0, 12)}...</p>
                )}
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">{pool.asset2.currency}</p>
                <p className="text-3xl font-bold">{pool.asset2.amount.toLocaleString()}</p>
                {pool.asset2.issuer && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{pool.asset2.issuer.slice(0, 12)}...</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Liquidity Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Liquidity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Liquidity</DialogTitle>
                  <DialogDescription>
                    Deposit tokens to earn trading fees from this pool.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{pool.asset1.currency} Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={asset1Amount}
                      onChange={(e) => setAsset1Amount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{pool.asset2.currency} Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={asset2Amount}
                      onChange={(e) => setAsset2Amount(e.target.value)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Estimated LP Tokens: {asset1Amount && asset2Amount ? "~1,234.56" : "—"}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDepositOpen(false)}>Cancel</Button>
                  <Button onClick={handleDeposit} disabled={!asset1Amount || !asset2Amount}>
                    Add Liquidity
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Liquidity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Liquidity</DialogTitle>
                  <DialogDescription>
                    Withdraw your LP tokens to receive underlying assets.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>LP Tokens to Withdraw</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <p className="text-sm text-muted-foreground">You will receive:</p>
                    <p className="font-medium">~50,000 {pool.asset1.currency}</p>
                    <p className="font-medium">~25,000 {pool.asset2.currency}</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                  <Button onClick={handleWithdraw}>Remove Liquidity</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <Vote className="h-4 w-4 mr-2" />
              Vote on Fee
            </Button>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="positions">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="positions">LP Positions ({positions.length})</TabsTrigger>
            <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
            <TabsTrigger value="details">Pool Details</TabsTrigger>
          </TabsList>

          <TabsContent value="positions">
            <Card>
              <CardContent className="pt-6">
                {positions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No LP positions in this pool</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investor</TableHead>
                        <TableHead>Share</TableHead>
                        <TableHead>LP Tokens</TableHead>
                        <TableHead>Value (USD)</TableHead>
                        <TableHead>P&L</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((pos) => (
                        <TableRow key={pos.id}>
                          <TableCell className="font-mono text-sm">{pos.investorId}</TableCell>
                          <TableCell>{pos.sharePercentage.toFixed(2)}%</TableCell>
                          <TableCell>{pos.lpTokenBalance.toLocaleString()}</TableCell>
                          <TableCell>${pos.valueUsd.toLocaleString()}</TableCell>
                          <TableCell className={pos.pnlUsd >= 0 ? "text-emerald-500" : "text-destructive"}>
                            {pos.pnlUsd >= 0 ? "+" : ""}${pos.pnlUsd.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardContent className="pt-6">
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>{pool.asset1.currency}</TableHead>
                        <TableHead>{pool.asset2.currency}</TableHead>
                        <TableHead>LP Tokens</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <Badge variant="outline">{tx.type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{tx.actor.slice(0, 10)}...</TableCell>
                          <TableCell className={tx.asset1Delta >= 0 ? "text-emerald-500" : "text-destructive"}>
                            {tx.asset1Delta >= 0 ? "+" : ""}{tx.asset1Delta.toLocaleString()}
                          </TableCell>
                          <TableCell className={tx.asset2Delta >= 0 ? "text-emerald-500" : "text-destructive"}>
                            {tx.asset2Delta >= 0 ? "+" : ""}{tx.asset2Delta.toLocaleString()}
                          </TableCell>
                          <TableCell className={tx.lpTokenDelta >= 0 ? "text-emerald-500" : "text-destructive"}>
                            {tx.lpTokenDelta >= 0 ? "+" : ""}{tx.lpTokenDelta.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(tx.timestamp), "MMM d, h:mm a")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Pool ID</p>
                    <p className="font-mono text-sm break-all">{pool.poolId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">LP Token ID</p>
                    <p className="font-mono text-sm break-all">{pool.lpTokenId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
                    <p className="font-medium">{format(new Date(pool.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Creation TX</p>
                  <ExplorerLinkBadge type="tx" value={pool.createTxHash} network={pool.network} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
