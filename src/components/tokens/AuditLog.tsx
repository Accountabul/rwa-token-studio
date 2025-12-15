import React from "react";
import { TokenAuditEntry, tokenActionLabel } from "@/types/tokenAudit";
import { roleLabel } from "@/types/tokenization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Clock, User } from "lucide-react";

interface AuditLogProps {
  entries: TokenAuditEntry[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ entries }) => {
  const handleExport = () => {
    const csv = [
      ["Timestamp", "Action", "Performed By", "Role", "Description", "XRPL TX Hash"].join(","),
      ...entries.map((e) =>
        [
          e.timestamp,
          e.action,
          e.performedBy,
          e.role,
          `"${e.description}"`,
          e.xrplTxHash || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "ISSUED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "MINTED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "BURNED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "FROZEN":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "DISTRIBUTED":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-muted text-muted-foreground border-muted-foreground/30";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Audit Trail</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No audit entries yet
          </p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.id} className="relative pl-6 pb-4 last:pb-0">
                {/* Timeline line */}
                {index < entries.length - 1 && (
                  <div className="absolute left-[9px] top-6 bottom-0 w-px bg-border" />
                )}
                
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1.5 w-[18px] h-[18px] rounded-full border-2 ${getActionColor(entry.action)}`} />
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getActionColor(entry.action)}`}>
                      {tokenActionLabel[entry.action]}
                    </span>
                    {entry.xrplTxHash && (
                      <Button variant="ghost" size="sm" className="h-5 gap-1 text-xs text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        View TX
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground">{entry.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {entry.performedBy} ({roleLabel[entry.role]})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
