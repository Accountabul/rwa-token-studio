import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Banknote, User, FileCheck, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockChecks } from "@/data/mockChecks";
import { ExplorerLinkBadge } from "@/components/tokens/ExplorerLinkBadge";
import { format, formatDistanceToNow, isPast } from "date-fns";
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

const statusConfig = {
  PENDING: { label: "Pending", variant: "default" as const, icon: Clock },
  CASHED: { label: "Cashed", variant: "default" as const, icon: CheckCircle },
  CANCELLED: { label: "Cancelled", variant: "secondary" as const, icon: XCircle },
  EXPIRED: { label: "Expired", variant: "destructive" as const, icon: Calendar },
};

export default function CheckDetailsPage() {
  const { checkId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const check = mockChecks.find((c) => c.id === checkId);

  if (!check) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold">Check not found</h1>
          <Button onClick={() => navigate("/checks")} className="mt-4">
            Back to Checks
          </Button>
        </div>
      </div>
    );
  }

  const config = statusConfig[check.status];
  const StatusIcon = config.icon;
  const isExpired = check.expiration && isPast(new Date(check.expiration));
  const canCash = check.status === "PENDING" && !isExpired;
  const canCancel = check.status === "PENDING";

  const handleCash = () => {
    toast({
      title: "Check Cashed",
      description: `Successfully cashed check for ${check.amount.toLocaleString()} ${check.currency}`,
    });
  };

  const handleCancel = () => {
    toast({
      title: "Check Cancelled",
      description: "Check has been cancelled successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/checks")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Check Details</h1>
            <p className="text-sm text-muted-foreground font-mono">{check.checkId.slice(0, 16)}...</p>
          </div>
          <Badge
            variant={config.variant}
            className={
              check.status === "CASHED"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : check.status === "PENDING"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : ""
            }
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {/* Amount Card */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Amount</p>
              <p className="text-4xl font-bold">
                {check.amount.toLocaleString()} <span className="text-xl text-muted-foreground">{check.currency}</span>
              </p>
              {check.currencyIssuer && (
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  Issuer: {check.currencyIssuer.slice(0, 12)}...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Sender
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{check.senderName || "Unknown"}</p>
              <ExplorerLinkBadge type="address" value={check.sender} network={check.network} />
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
              <p className="font-medium">{check.destinationName || "Unknown"}</p>
              <ExplorerLinkBadge type="address" value={check.destination} network={check.network} />
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Check Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
                <p className="font-medium">{format(new Date(check.createdAt), "MMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(check.createdAt), "h:mm a")}</p>
              </div>
              {check.expiration && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Expires</p>
                  <p className={`font-medium ${isExpired ? "text-destructive" : ""}`}>
                    {format(new Date(check.expiration), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isExpired ? "Expired" : formatDistanceToNow(new Date(check.expiration), { addSuffix: true })}
                  </p>
                </div>
              )}
              {check.cashedAt && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Cashed</p>
                  <p className="font-medium text-emerald-500">{format(new Date(check.cashedAt), "MMM d, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(check.cashedAt), "h:mm a")}</p>
                </div>
              )}
              {check.cancelledAt && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Cancelled</p>
                  <p className="font-medium">{format(new Date(check.cancelledAt), "MMM d, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(check.cancelledAt), "h:mm a")}</p>
                </div>
              )}
              {check.invoiceId && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice ID</p>
                  <p className="font-medium">{check.invoiceId}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Transaction Hashes */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Transactions</p>
              <div className="grid gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Creation TX</p>
                  <ExplorerLinkBadge type="tx" value={check.createTxHash} network={check.network} />
                </div>
                {check.cashTxHash && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cash TX</p>
                    <ExplorerLinkBadge type="tx" value={check.cashTxHash} network={check.network} />
                  </div>
                )}
                {check.cancelTxHash && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cancel TX</p>
                    <ExplorerLinkBadge type="tx" value={check.cancelTxHash} network={check.network} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {(canCash || canCancel) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              {canCash && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="flex-1">
                      <Banknote className="h-4 w-4 mr-2" />
                      Cash Check
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cash this check?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will redeem {check.amount.toLocaleString()} {check.currency} to the destination account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCash}>Cash Check</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Check
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this check?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The check will be permanently cancelled.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Check</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">
                        Cancel Check
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
