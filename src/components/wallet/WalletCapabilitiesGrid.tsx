import React from "react";
import { 
  Coins, 
  ImageIcon, 
  RotateCcw, 
  Snowflake, 
  Lock, 
  BarChart3, 
  ArrowRightLeft, 
  UserCheck,
  Tag
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WalletCapabilities } from "@/types/token";
import { cn } from "@/lib/utils";

interface WalletCapabilitiesGridProps {
  capabilities: WalletCapabilities;
  onChange: (capabilities: WalletCapabilities) => void;
  disabled?: boolean;
}

interface CapabilityItem {
  key: keyof WalletCapabilities;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const capabilityItems: CapabilityItem[] = [
  {
    key: "canIssueTokens",
    label: "Issue Tokens",
    description: "Create and issue IOU/MPT tokens",
    icon: Coins,
    color: "text-amber-500",
  },
  {
    key: "canMintNfts",
    label: "Mint NFTs",
    description: "Create and mint NFTokens",
    icon: ImageIcon,
    color: "text-purple-500",
  },
  {
    key: "canClawback",
    label: "Clawback",
    description: "Recover tokens from holders",
    icon: RotateCcw,
    color: "text-red-500",
  },
  {
    key: "canFreeze",
    label: "Freeze",
    description: "Freeze token trustlines",
    icon: Snowflake,
    color: "text-blue-500",
  },
  {
    key: "canCreateEscrows",
    label: "Create Escrows",
    description: "Set up conditional escrows",
    icon: Lock,
    color: "text-green-500",
  },
  {
    key: "canManageAmm",
    label: "Manage AMM",
    description: "Create and manage AMM pools",
    icon: BarChart3,
    color: "text-cyan-500",
  },
  {
    key: "canCreateChannels",
    label: "Payment Channels",
    description: "Create payment channels",
    icon: ArrowRightLeft,
    color: "text-indigo-500",
  },
  {
    key: "canAuthorizeHolders",
    label: "Authorize Holders",
    description: "Approve trustline holders",
    icon: UserCheck,
    color: "text-emerald-500",
  },
  {
    key: "requiresDestinationTag",
    label: "Require Dest. Tag",
    description: "Mandate destination tags",
    icon: Tag,
    color: "text-orange-500",
  },
];

export const WalletCapabilitiesGrid: React.FC<WalletCapabilitiesGridProps> = ({
  capabilities,
  onChange,
  disabled = false,
}) => {
  const toggleCapability = (key: keyof WalletCapabilities) => {
    onChange({
      ...capabilities,
      [key]: !capabilities[key],
    });
  };

  const enabledCount = Object.values(capabilities).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {enabledCount} of {capabilityItems.length} capabilities enabled
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {capabilityItems.map((item) => {
          const Icon = item.icon;
          const isEnabled = capabilities[item.key];

          return (
            <div
              key={item.key}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                isEnabled
                  ? "bg-primary/5 border-primary/30"
                  : "bg-muted/30 border-border hover:border-primary/20",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !disabled && toggleCapability(item.key)}
            >
              <Checkbox
                checked={isEnabled}
                onCheckedChange={() => toggleCapability(item.key)}
                disabled={disabled}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", item.color)} />
                  <Label className="text-sm font-medium cursor-pointer">
                    {item.label}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Default empty capabilities
export const defaultCapabilities: WalletCapabilities = {
  canIssueTokens: false,
  canMintNfts: false,
  canClawback: false,
  canFreeze: false,
  canCreateEscrows: false,
  canManageAmm: false,
  canCreateChannels: false,
  canAuthorizeHolders: false,
  requiresDestinationTag: false,
};
