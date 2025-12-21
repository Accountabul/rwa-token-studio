import React from "react";
import { UnifiedAuditEntry } from "@/types/reportsAndLogs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  User, 
  Monitor, 
  Globe,
  ArrowRight,
  Copy
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AuditLogDrawerProps {
  entry: UnifiedAuditEntry | null;
  onClose: () => void;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const renderStateDiff = () => {
    if (!entry.beforeState && !entry.afterState) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">State Changes</h4>
        <div className="grid grid-cols-2 gap-4">
          {entry.beforeState && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Before
              </p>
              <pre className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-xs font-mono overflow-auto max-h-48">
                {JSON.stringify(entry.beforeState, null, 2)}
              </pre>
            </div>
          )}
          {entry.afterState && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                After
              </p>
              <pre className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs font-mono overflow-auto max-h-48">
                {JSON.stringify(entry.afterState, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={!!entry} onOpenChange={() => onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {entry.entityType}
            </Badge>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant="default" className="text-xs">
              {entry.action.replace(/_/g, " ")}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Entity Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Entity</h4>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Name</span>
                <span className="text-sm font-medium">{entry.entityName || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono">{entry.entityId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(entry.entityId, "Entity ID")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actor Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Actor</h4>
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{entry.actorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.actorRole.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              {entry.sourceIp && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{entry.sourceIp}</span>
                </div>
              )}
              {entry.userAgent && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="truncate">{entry.userAgent}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Timestamp */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Timestamp</h4>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">
                {format(new Date(entry.createdAt), "MMMM d, yyyy 'at' HH:mm:ss")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(entry.createdAt), "EEEE")} • UTC
              </p>
            </div>
          </div>

          {/* XRPL Transaction */}
          {entry.xrplTxHash && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">XRPL Transaction</h4>
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono break-all">
                      {entry.xrplTxHash}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(entry.xrplTxHash!, "TX Hash")}
                      className="gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1.5"
                    >
                      <a
                        href={`https://livenet.xrpl.org/transactions/${entry.xrplTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View on XRPL
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* State Changes */}
          {(entry.beforeState || entry.afterState) && (
            <>
              <Separator />
              {renderStateDiff()}
            </>
          )}

          {/* Metadata */}
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Additional Metadata</h4>
                <pre className="p-4 rounded-lg bg-muted/50 text-xs font-mono overflow-auto max-h-48">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              </div>
            </>
          )}

          {/* Audit Entry ID */}
          <Separator />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Audit Entry ID</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{entry.id}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => copyToClipboard(entry.id, "Audit Entry ID")}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
