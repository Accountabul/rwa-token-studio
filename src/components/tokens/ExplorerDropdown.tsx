import React from "react";
import { ExternalLink, Wallet, Coins, History, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { buildTokenExplorerLinks, getExplorerConfig, XRPLNetwork, networkLabels } from "@/lib/xrplExplorer";
import { TokenStandard, IOUProperties } from "@/types/token";

interface ExplorerDropdownProps {
  standard: TokenStandard;
  issuerAddress: string;
  currencyCode?: string;
  txHash?: string;
  network?: XRPLNetwork;
  mptId?: string;
  nftId?: string;
}

export const ExplorerDropdown: React.FC<ExplorerDropdownProps> = ({
  standard,
  issuerAddress,
  currencyCode,
  txHash,
  network = "mainnet",
  mptId,
  nftId,
}) => {
  const links = buildTokenExplorerLinks({
    standard,
    issuerAddress,
    currencyCode,
    txHash,
    mptId,
    nftId,
    network,
  });

  const explorerConfig = getExplorerConfig(network);

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Explorer
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border border-border z-50">
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Network</span>
            <Badge variant="outline" className="text-[10px]">
              {networkLabels[network]}
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground">{explorerConfig.name}</span>
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => openLink(links.issuerWallet)} className="gap-2 cursor-pointer">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span>Issuer Wallet</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {issuerAddress.slice(0, 8)}...{issuerAddress.slice(-6)}
            </span>
          </div>
        </DropdownMenuItem>

        {links.token && (
          <DropdownMenuItem onClick={() => openLink(links.token!)} className="gap-2 cursor-pointer">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span>Token on XRPL</span>
              <span className="text-[10px] text-muted-foreground">
                {standard === "IOU" && currencyCode && `${currencyCode} • IOU`}
                {standard === "MPT" && "Multi-Purpose Token"}
                {standard === "NFT" && "Non-Fungible Token"}
              </span>
            </div>
          </DropdownMenuItem>
        )}

        {links.issuanceTx && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openLink(links.issuanceTx!)} className="gap-2 cursor-pointer">
              <History className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span>Issuance Transaction</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {txHash?.slice(0, 12)}...
                </span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
