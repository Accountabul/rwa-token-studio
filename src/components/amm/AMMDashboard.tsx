import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets, TrendingUp, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAMMPools } from "@/data/mockAMMPools";
import { format } from "date-fns";
import { CreatePoolDialog } from "./CreatePoolDialog";

export function AMMDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredPools = mockAMMPools.filter((pool) => {
    return pool.asset1.currency.toLowerCase().includes(search.toLowerCase()) ||
      pool.asset2.currency.toLowerCase().includes(search.toLowerCase());
  });

  const stats = {
    totalPools: mockAMMPools.length,
    totalTVL: mockAMMPools.reduce((sum, p) => sum + p.totalValueLockedUsd, 0),
    totalVolume: mockAMMPools.reduce((sum, p) => sum + p.volume24hUsd, 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Pools</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.totalPools}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Value Locked</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">${stats.totalTVL.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">24h Volume</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">${stats.totalVolume.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search pools..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <CreatePoolDialog />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pool</TableHead>
                <TableHead>TVL</TableHead>
                <TableHead>24h Volume</TableHead>
                <TableHead>APY</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPools.map((pool) => (
                <TableRow key={pool.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/amm/${pool.id}`)}>
                  <TableCell>
                    <p className="font-medium">{pool.asset1.currency} / {pool.asset2.currency}</p>
                  </TableCell>
                  <TableCell className="font-medium">${pool.totalValueLockedUsd.toLocaleString()}</TableCell>
                  <TableCell>${pool.volume24hUsd.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      <TrendingUp className="h-3 w-3 mr-1" />{pool.apy.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{(pool.tradingFee * 100).toFixed(2)}%</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(pool.createdAt), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
