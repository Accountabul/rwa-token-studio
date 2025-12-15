import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Zap, Lock, Unlock, User, Send, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPaymentChannels, mockChannelClaims } from "@/data/mockPaymentChannels";
import { ExplorerLinkBadge } from "@/components/tokens/ExplorerLinkBadge";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusConfig = {
  OPEN: { label: "Open", variant: "default" as const, className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  PENDING_CLOSE: { label: "Pending Close", variant: "default" as const, className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  CLOSED: { label: "Closed", variant: "secondary" as const, className: "" },
};

export default function ChannelDetailsPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const channel = mockPaymentChannels.find((c) => c.id === channelId);
  const claims = mockChannelClaims.filter((c) => c.channelId === channel?.channelId);

  if (!channel) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold">Channel not found</h1>
          <Button onClick={() => navigate("/channels")} className="mt-4">
            Back to Channels
          </Button>
        </div>
      </div>
    );
  }

  const config = statusConfig[channel.status];
  const usedAmount = channel.amount - channel.balance;
  const usedPercentage = (usedAmount / channel.amount) * 100;

  const handleClose = () => {
    toast({
      title: "Channel Close Initiated",
      description: `Settlement period: ${channel.settleDelay / 3600} hours`,
    });
  };

  const handleGenerateClaim = () => {
    toast({
      title: "Claim Generated",
      description: "Off-ledger claim signature created. Share with destination.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/channels")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Payment Channel</h1>
            <p className="text-sm text-muted-foreground font-mono">{channel.channelId.slice(0, 16)}...</p>
          </div>
          <Badge variant={config.variant} className={config.className}>
            {config.label}
          </Badge>
        </div>

        {/* Balance Card */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Remaining Balance</p>
                  <p className="text-4xl font-bold">
                    {channel.balance.toLocaleString()} <span className="text-xl text-muted-foreground">XRP</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Total Capacity</p>
                  <p className="text-xl font-medium text-muted-foreground">{channel.amount.toLocaleString()} XRP</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Used: {usedAmount.toLocaleString()} XRP</span>
                  <span>{usedPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={usedPercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Send className="h-4 w-4" />
                Sender
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{channel.senderName || "Unknown"}</p>
              <ExplorerLinkBadge type="address" value={channel.sender} network={channel.network} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Destination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{channel.destinationName || "Unknown"}</p>
              <ExplorerLinkBadge type="address" value={channel.destination} network={channel.network} />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Channel Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
                    <p className="font-medium">{format(new Date(channel.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Settle Delay</p>
                    <p className="font-medium">{channel.settleDelay / 3600} hours</p>
                  </div>
                  {channel.expiration && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Expires</p>
                      <p className="font-medium">{format(new Date(channel.expiration), "MMM d, yyyy")}</p>
                    </div>
                  )}
                  {channel.cancelAfter && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Cancel After</p>
                      <p className="font-medium">{format(new Date(channel.cancelAfter), "MMM d, yyyy")}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Transactions</p>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Creation TX</p>
                    <ExplorerLinkBadge type="tx" value={channel.createTxHash} network={channel.network} />
                  </div>
                  {channel.closeTxHash && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Close TX</p>
                      <ExplorerLinkBadge type="tx" value={channel.closeTxHash} network={channel.network} />
                    </div>
                  )}
                </div>

                {channel.publicKey && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Public Key</p>
                      <p className="font-mono text-xs break-all">{channel.publicKey}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Claim History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {claims.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No claims generated yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Signature</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">{claim.amount.toLocaleString()} XRP</TableCell>
                          <TableCell>{format(new Date(claim.createdAt), "MMM d, h:mm a")}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                claim.redeemed
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }
                            >
                              {claim.redeemed ? "Redeemed" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">{claim.signature.slice(0, 16)}...</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        {channel.status === "OPEN" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={handleGenerateClaim} className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                Generate Claim
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Lock className="h-4 w-4 mr-2" />
                    Request Close
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Close this channel?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will initiate a {channel.settleDelay / 3600} hour settlement period before the channel is closed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClose}>Request Close</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
