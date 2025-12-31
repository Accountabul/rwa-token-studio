import React from "react";
import { Copy, ExternalLink, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { XRPLAsset } from "@/types/xrplAsset";
import { buildExplorerLink, XRPLNetwork } from "@/lib/xrplExplorer";

interface SelectedAssetDisplayProps {
  asset: XRPLAsset;
  network?: XRPLNetwork;
  label?: string;
  className?: string;
}

export const SelectedAssetDisplay: React.FC<SelectedAssetDisplayProps> = ({
  asset,
  network = "mainnet",
  label = "Selected Asset",
  className,
}) => {
  const handleCopyIssuer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (asset.issuer) {
      navigator.clipboard.writeText(asset.issuer);
      toast.success("Issuer address copied");
    }
  };

  const handleOpenExplorer = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      let url: string;
      if (asset.type === "XRP") {
        // For XRP, link to a general XRP page or just skip
        url = network === "testnet" 
          ? "https://testnet.xrpl.org" 
          : "https://xrpscan.com";
      } else if (asset.issuer) {
        url = buildExplorerLink({
          type: "TOKEN_IOU",
          currencyCode: asset.currency,
          issuer: asset.issuer,
          network,
        });
      } else {
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to open explorer:", err);
    }
  };

  return (
    <div className={`p-3 rounded-lg border bg-muted/30 ${className || ""}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
      <div className="flex items-center gap-2">
        {/* Logo */}
        <div className="w-7 h-7 rounded-full bg-background border flex items-center justify-center shrink-0">
          <Coins className="w-4 h-4 text-muted-foreground" />
        </div>
        
        {/* Asset info - single line */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto text-sm">
          <span className="font-semibold shrink-0">{asset.currency}</span>
          {asset.name && asset.name !== asset.currency && (
            <>
              <span className="text-muted-foreground">—</span>
              <span className="text-muted-foreground shrink-0">{asset.name}</span>
            </>
          )}
          {asset.type !== "XRP" && asset.issuer && (
            <>
              <span className="text-muted-foreground shrink-0">·</span>
              <span className="text-muted-foreground shrink-0">Issuer:</span>
              <span className="font-mono text-xs text-foreground">{asset.issuer}</span>
            </>
          )}
          {asset.type === "XRP" && (
            <>
              <span className="text-muted-foreground shrink-0">·</span>
              <span className="text-xs text-muted-foreground shrink-0">Native Asset</span>
            </>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {asset.type !== "XRP" && asset.issuer && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopyIssuer}
              title="Copy issuer address"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleOpenExplorer}
            title="View in explorer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectedAssetDisplay;
