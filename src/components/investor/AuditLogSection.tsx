import React from "react";
import { AuditLogEntry } from "@/types/investor";
import { History, CheckCircle2, XCircle, User, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuditLogSectionProps {
  entries: AuditLogEntry[];
}

export const AuditLogSection: React.FC<AuditLogSectionProps> = ({ entries }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">
            Activity & Audit Log
          </h4>
        </div>
        <Badge variant="outline" className="text-[10px] bg-muted/30">
          Immutable
        </Badge>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No activity recorded for this investor.
        </p>
      ) : (
        <div className="space-y-1">
          {sortedEntries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                index === 0 ? "bg-muted/30" : "hover:bg-muted/20"
              } transition-colors`}
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {formatDate(entry.timestamp)}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {formatTime(entry.timestamp)}
                </span>
              </div>

              <div className="w-px h-10 bg-border/50" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {entry.actorType === "SYSTEM" ? (
                    <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
                      <Server className="w-2.5 h-2.5" />
                      SYSTEM
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1">
                      <User className="w-2.5 h-2.5" />
                      ADMIN
                    </Badge>
                  )}
                  {entry.actorType === "ADMIN" && (
                    <span className="text-[10px] text-muted-foreground truncate">
                      {entry.actor}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground mt-1">{entry.action}</p>
                {entry.details && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {entry.details}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                {entry.result === "SUCCESS" ? (
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-600 border-red-500/20 gap-1">
                    <XCircle className="w-2.5 h-2.5" />
                    Failed
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground mt-4 text-center">
        Audit log entries are immutable and append-only for compliance purposes.
      </p>
    </div>
  );
};
