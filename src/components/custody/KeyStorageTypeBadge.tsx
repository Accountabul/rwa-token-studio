import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  KeyStorageType, 
  keyStorageTypeLabel, 
  keyStorageTypeDescription,
  keyStorageSecurityLevel,
  requiresMigration,
} from "@/types/custody";
import { Database, Shield, Server, Building, AlertTriangle } from "lucide-react";

interface KeyStorageTypeBadgeProps {
  type: KeyStorageType;
  showTooltip?: boolean;
  size?: "sm" | "default";
}

const iconMap: Record<KeyStorageType, React.ElementType> = {
  LEGACY_DB: Database,
  VAULT: Shield,
  HSM: Server,
  EXTERNAL: Building,
};

const colorMap: Record<KeyStorageType, string> = {
  LEGACY_DB: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  VAULT: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  HSM: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  EXTERNAL: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export function KeyStorageTypeBadge({ 
  type, 
  showTooltip = true,
  size = "default" 
}: KeyStorageTypeBadgeProps) {
  const Icon = iconMap[type];
  const needsMigration = requiresMigration(type);
  const securityLevel = keyStorageSecurityLevel[type];
  
  const badge = (
    <Badge 
      variant="outline" 
      className={`${colorMap[type]} ${size === "sm" ? "text-xs px-1.5 py-0" : ""} inline-flex items-center gap-1`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span>{keyStorageTypeLabel[type]}</span>
      {needsMigration && (
        <AlertTriangle className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      )}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{keyStorageTypeLabel[type]}</p>
            <p className="text-xs text-muted-foreground">
              {keyStorageTypeDescription[type]}
            </p>
            <div className="flex items-center gap-2 text-xs pt-1">
              <span className="text-muted-foreground">Security:</span>
              <Badge 
                variant="outline" 
                className={
                  securityLevel === "critical" ? "bg-emerald-500/10 text-emerald-600" :
                  securityLevel === "high" ? "bg-blue-500/10 text-blue-600" :
                  securityLevel === "medium" ? "bg-amber-500/10 text-amber-600" :
                  "bg-red-500/10 text-red-600"
                }
              >
                {securityLevel.toUpperCase()}
              </Badge>
            </div>
            {needsMigration && (
              <p className="text-xs text-amber-600 pt-1">
                ⚠️ Migration to vault-backed storage recommended
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
