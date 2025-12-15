import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Clock, Lock, CheckCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPaymentChannels } from "@/data/mockPaymentChannels";
import { format } from "date-fns";
import { PaymentChannelStatus } from "@/types/paymentChannel";
import { CreateChannelDialog } from "./CreateChannelDialog";

const statusConfig: Record<PaymentChannelStatus, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  PENDING_CLOSE: { label: "Pending Close", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  CLOSED: { label: "Closed", className: "bg-muted text-muted-foreground" },
};

export function PaymentChannelDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | PaymentChannelStatus>("all");

  const filteredChannels = mockPaymentChannels.filter((channel) => {
    const matchesSearch = channel.destinationName?.toLowerCase().includes(search.toLowerCase()) ||
      channel.senderName?.toLowerCase().includes(search.toLowerCase()) ||
      channel.channelId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || channel.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    open: mockPaymentChannels.filter((c) => c.status === "OPEN").length,
    totalCapacity: mockPaymentChannels.filter((c) => c.status === "OPEN").reduce((sum, c) => sum + c.amount, 0),
    totalBalance: mockPaymentChannels.filter((c) => c.status === "OPEN").reduce((sum, c) => sum + c.balance, 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Open Channels</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-emerald-500">{stats.open}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.totalCapacity.toLocaleString()} XRP</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.totalBalance.toLocaleString()} XRP</p></CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search channels..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="OPEN">Open</TabsTrigger>
            <TabsTrigger value="PENDING_CLOSE">Pending</TabsTrigger>
            <TabsTrigger value="CLOSED">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
        <CreateChannelDialog />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destination</TableHead>
                <TableHead>Balance / Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Settle Delay</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChannels.map((channel) => {
                const config = statusConfig[channel.status];
                const usedPct = ((channel.amount - channel.balance) / channel.amount) * 100;
                return (
                  <TableRow key={channel.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/channels/${channel.id}`)}>
                    <TableCell>
                      <p className="font-medium">{channel.destinationName || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{channel.destination.slice(0, 12)}...</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{channel.balance.toLocaleString()} / {channel.amount.toLocaleString()} XRP</p>
                        <Progress value={usedPct} className="h-1.5 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={config.className}>{config.label}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{channel.settleDelay / 3600}h</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(channel.createdAt), "MMM d, yyyy")}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
