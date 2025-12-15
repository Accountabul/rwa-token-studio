import React from "react";
import { ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { shortenAddress, shortenTxHash, buildExplorerLink, XRPLNetwork } from "@/lib/xrplExplorer";
import { toast } from "sonner";

interface ExplorerLinkBadgeProps {
  type: "address" | "tx" | "token";
  value: string;
  network?: XRPLNetwork;
  currencyCode?: string;
  issuer?: string;
  label?: string;
  showCopy?: boolean;
  className?: string;
}

export const ExplorerLinkBadge: React.FC<ExplorerLinkBadgeProps> = ({
  type,
  value,
  network = "mainnet",
  currencyCode,
  issuer,
  label,
  showCopy = true,
  className = "",
}) => {
  const getExplorerUrl = (): string => {
    switch (type) {
      case "address":
        return buildExplorerLink({ type: "ACCOUNT", address: value, network });
      case "tx":
        return buildExplorerLink({ type: "TX", txHash: value, network });
      case "token":
        if (currencyCode && issuer) {
          return buildExplorerLink({ type: "TOKEN_IOU", currencyCode, issuer, network });
        }
        return buildExplorerLink({ type: "ACCOUNT", address: value, network });
      default:
        return "#";
    }
  };

  const getDisplayValue = (): string => {
    if (label) return label;
    switch (type) {
      case "address":
        return shortenAddress(value);
      case "tx":
        return shortenTxHash(value);
      default:
        return value;
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const handleOpenExplorer = () => {
    window.open(getExplorerUrl(), "_blank", "noopener,noreferrer");
  };

  return (
    <TooltipProvider>
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleOpenExplorer}
              className="inline-flex items-center gap-1.5 text-xs font-mono bg-muted/50 hover:bg-muted px-2 py-1 rounded transition-colors"
            >
              <code className="text-foreground">{getDisplayValue()}</code>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-popover text-popover-foreground border border-border">
            <p className="text-xs">View on XRPL Explorer</p>
            <p className="text-[10px] text-muted-foreground font-mono">{value}</p>
          </TooltipContent>
        </Tooltip>

        {showCopy && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground border border-border">
              <p className="text-xs">Copy full value</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
