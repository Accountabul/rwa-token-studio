import { KBEntry } from "@/types/knowledgeBase";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface KBEntryListProps {
  entries: KBEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: KBEntry) => void;
}

export function KBEntryList({ entries, selectedEntryId, onSelectEntry }: KBEntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No entries found
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-2 pr-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedEntryId === entry.id
                ? "bg-primary/10 border border-primary/20"
                : "bg-muted/30 hover:bg-muted/50 border border-transparent"
            }`}
            onClick={() => onSelectEntry(entry)}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm">{entry.title}</h4>
              <Badge variant="outline" className="text-xs font-mono">
                {entry.key}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {entry.definition}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>v{entry.currentVersion}</span>
              <span>Updated {formatDistanceToNow(entry.updatedAt, { addSuffix: true })}</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
