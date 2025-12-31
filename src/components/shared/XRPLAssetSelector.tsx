import React, { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Copy, ExternalLink, Loader2, Search, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  XRPLAsset,
  XRPLAssetSearchResult,
  createXRPAsset,
} from "@/types/xrplAsset";
import { searchXRPLAssets, XRPLNetwork } from "@/lib/xrplAssetApi";
import { buildExplorerLink } from "@/lib/xrplExplorer";

interface XRPLAssetSelectorProps {
  value: XRPLAsset | null;
  onChange: (asset: XRPLAsset) => void;
  network?: XRPLNetwork;
  disabled?: boolean;
  placeholder?: string;
  excludeXRP?: boolean;
  className?: string;
}

export const XRPLAssetSelector: React.FC<XRPLAssetSelectorProps> = ({
  value,
  onChange,
  network = "mainnet",
  disabled = false,
  placeholder = "Select asset...",
  excludeXRP = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<XRPLAssetSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load assets when popover opens or search query changes
  useEffect(() => {
    if (!open) return;
    
    const loadAssets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("[XRPLAssetSelector] Searching for:", searchQuery);
        const assets = await searchXRPLAssets(searchQuery, {
          network,
          includeXRP: !excludeXRP,
          limit: 25,
        });
        console.log("[XRPLAssetSelector] Got results:", assets.length);
        setResults(assets);
      } catch (err) {
        console.error("Asset search failed:", err);
        setError("Failed to search assets");
        // Show XRP as fallback
        if (!excludeXRP) {
          setResults([{ type: "XRP", currency: "XRP", name: "XRP (Native)" }]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce for typing, immediate for initial load
    if (searchQuery === "" && results.length === 0) {
      loadAssets();
    } else {
      const timer = setTimeout(loadAssets, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, open, network, excludeXRP]);

  // Reset search when opening
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setResults([]);
    }
  }, [open]);

  const handleSelect = useCallback((result: XRPLAssetSearchResult) => {
    const asset: XRPLAsset = {
      type: result.type,
      currency: result.currency,
      issuer: result.issuer,
      name: result.name,
    };
    onChange(asset);
    setOpen(false);
    setSearchQuery("");
  }, [onChange]);

  const handleCopyIssuer = useCallback((issuer: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(issuer);
    toast.success("Issuer address copied");
  }, []);

  const handleOpenExplorer = useCallback((result: XRPLAssetSearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (result.type === "XRP") {
        const url = network === "testnet" 
          ? "https://testnet.xrpl.org" 
          : "https://xrpscan.com";
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      if (!result.issuer) return;
      const url = buildExplorerLink({
        type: "TOKEN_IOU",
        currencyCode: result.currency,
        issuer: result.issuer,
        network,
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to open explorer:", err);
    }
  }, [network]);

  const getAssetTypeBadge = (type: string) => {
    switch (type) {
      case "XRP":
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">Native</Badge>;
      case "IOU":
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">IOU</Badge>;
      case "MPT":
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/50 shrink-0">MPT</Badge>;
      default:
        return null;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium">{value.currency}</span>
              {value.name && value.name !== value.currency && (
                <span className="text-xs text-muted-foreground truncate">
                  — {value.name}
                </span>
              )}
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search by ticker, name, or issuer address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
          </div>
          <CommandList className="max-h-[320px]">
            {error && (
              <div className="px-3 py-2 text-sm text-destructive">{error}</div>
            )}
            <CommandEmpty>
              {isLoading ? "Searching..." : "No assets found."}
            </CommandEmpty>
            <CommandGroup>
              {results.map((result) => {
                const key = result.type === "XRP" 
                  ? "XRP" 
                  : `${result.currency}:${result.issuer}`;
                const isSelected = value?.type === result.type && 
                  value?.currency === result.currency && 
                  value?.issuer === result.issuer;
                
                return (
                  <CommandItem
                    key={key}
                    value={key}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-2 cursor-pointer py-2.5 px-2"
                  >
                    {/* Checkmark */}
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    
                    {/* Logo placeholder */}
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {result.icon ? (
                        <img src={result.icon} alt="" className="w-5 h-5 rounded-full" />
                      ) : (
                        <Coins className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Asset info - single line with full issuer */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto text-sm">
                      <span className="font-semibold shrink-0">{result.currency}</span>
                      {result.name && result.name !== result.currency && (
                        <>
                          <span className="text-muted-foreground">—</span>
                          <span className="text-muted-foreground shrink-0">{result.name}</span>
                        </>
                      )}
                      {result.issuer && (
                        <>
                          <span className="text-muted-foreground shrink-0">·</span>
                          <span className="text-muted-foreground shrink-0">Issuer:</span>
                          <span className="font-mono text-xs">{result.issuer}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Actions + Badge */}
                    <div className="flex items-center gap-1 shrink-0">
                      {result.issuer && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyIssuer(result.issuer!, e)}
                          className="p-1 hover:bg-muted rounded"
                          title="Copy issuer address"
                        >
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleOpenExplorer(result, e)}
                        className="p-1 hover:bg-muted rounded"
                        title="View in explorer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      {getAssetTypeBadge(result.type)}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default XRPLAssetSelector;
