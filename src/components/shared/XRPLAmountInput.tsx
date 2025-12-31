import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XRPLAssetSelector } from "./XRPLAssetSelector";
import {
  XRPLAsset,
  createXRPAsset,
  isXRP,
} from "@/types/xrplAsset";
import { XRPLNetwork } from "@/lib/xrplAssetApi";
import { cn } from "@/lib/utils";

interface XRPLAmountInputProps {
  asset: XRPLAsset | null;
  amount: string;
  onAssetChange: (asset: XRPLAsset) => void;
  onAmountChange: (amount: string) => void;
  network?: XRPLNetwork;
  disabled?: boolean;
  excludeXRP?: boolean;
  amountLabel?: string;
  assetLabel?: string;
  amountPlaceholder?: string;
  showLabels?: boolean;
  className?: string;
}

export const XRPLAmountInput: React.FC<XRPLAmountInputProps> = ({
  asset,
  amount,
  onAssetChange,
  onAmountChange,
  network = "mainnet",
  disabled = false,
  excludeXRP = false,
  amountLabel = "Amount",
  assetLabel = "Asset",
  amountPlaceholder = "0.00",
  showLabels = true,
  className,
}) => {
  // Determine decimal precision based on asset type
  // XRP has 6 decimal places (drops), IOUs typically use 15
  const decimalPlaces = isXRP(asset) ? 6 : 15;
  const step = Math.pow(10, -decimalPlaces);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string
    if (value === "") {
      onAmountChange("");
      return;
    }
    
    // Validate number format
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return;
    }
    
    onAmountChange(value);
  };

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {/* Amount Input */}
      <div className="col-span-2 space-y-2">
        {showLabels && <Label>{amountLabel}</Label>}
        <Input
          type="number"
          min="0"
          step={step}
          placeholder={amountPlaceholder}
          value={amount}
          onChange={handleAmountChange}
          disabled={disabled}
          className="font-mono"
        />
      </div>
      
      {/* Asset Selector */}
      <div className="space-y-2">
        {showLabels && <Label>{assetLabel}</Label>}
        <XRPLAssetSelector
          value={asset || createXRPAsset()}
          onChange={onAssetChange}
          network={network}
          disabled={disabled}
          excludeXRP={excludeXRP}
          placeholder="Asset"
        />
      </div>
    </div>
  );
};

// Simplified version that combines asset + amount in a single row
interface XRPLAssetAmountRowProps {
  asset: XRPLAsset | null;
  amount: string;
  onAssetChange: (asset: XRPLAsset) => void;
  onAmountChange: (amount: string) => void;
  network?: XRPLNetwork;
  disabled?: boolean;
  excludeXRP?: boolean;
  label?: string;
  className?: string;
}

export const XRPLAssetAmountRow: React.FC<XRPLAssetAmountRowProps> = ({
  asset,
  amount,
  onAssetChange,
  onAmountChange,
  network = "mainnet",
  disabled = false,
  excludeXRP = false,
  label,
  className,
}) => {
  const decimalPlaces = isXRP(asset) ? 6 : 15;
  const step = Math.pow(10, -decimalPlaces);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          step={step}
          placeholder="0.00"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          disabled={disabled}
          className="flex-1 font-mono"
        />
        <XRPLAssetSelector
          value={asset || createXRPAsset()}
          onChange={onAssetChange}
          network={network}
          disabled={disabled}
          excludeXRP={excludeXRP}
          placeholder="Asset"
          className="w-[140px]"
        />
      </div>
    </div>
  );
};

export default XRPLAmountInput;
