import React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { MPTFlagInfo } from "@/lib/mptFlags";

interface MPTFlagCardProps {
  flag: MPTFlagInfo;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const MPTFlagCard: React.FC<MPTFlagCardProps> = ({
  flag,
  enabled,
  onToggle,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border transition-colors",
        enabled
          ? "bg-primary/5 border-primary/30"
          : "bg-muted/30 border-border"
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{flag.name}</span>
          <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {flag.hex}
          </code>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        className="ml-4"
      />
    </div>
  );
};
