import React, { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Copy, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
  formatAssetWithIssuer,
  shortenAddress,
  createXRPAsset,
} from "@/types/xrplAsset";
import { searchXRPLAssets, XRPLNetwork } from "@/lib/xrplAssetApi";

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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!open) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const assets = await searchXRPLAssets(searchQuery, {
          network,
          includeXRP: !excludeXRP,
          limit: 20,
        });
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
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, open, network, excludeXRP]);

  // Load initial results when opening
  useEffect(() => {
    if (open && results.length === 0) {
      setSearchQuery("");
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

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(createXRPAsset()); // Reset to XRP
  }, [onChange]);

  const getAssetTypeBadge = (type: string) => {
    switch (type) {
      case "XRP":
        return <Badge variant="secondary" className="text-[10px] px-1 py-0">Native</Badge>;
      case "IOU":
        return <Badge variant="outline" className="text-[10px] px-1 py-0">IOU</Badge>;
      case "MPT":
        return <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/50">MPT</Badge>;
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
              {value.type !== "XRP" && value.issuer && (
                <span className="text-xs text-muted-foreground font-mono">
                  {shortenAddress(value.issuer)}
                </span>
              )}
              {getAssetTypeBadge(value.type)}
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search by ticker or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
          </div>
          <CommandList>
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
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.currency}</span>
                          {result.name && result.name !== result.currency && (
                            <span className="text-xs text-muted-foreground truncate">
                              {result.name}
                            </span>
                          )}
                        </div>
                        {result.issuer && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground font-mono">
                              {shortenAddress(result.issuer, 6)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyIssuer(result.issuer!, e)}
                              className="p-0.5 hover:bg-muted rounded"
                            >
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {getAssetTypeBadge(result.type)}
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
