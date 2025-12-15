import React, { useMemo } from "react";
import { TokenStandard } from "@/types/token";
import { TokenDraft } from "./TokenWizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MPTFlagCard } from "./MPTFlagCard";
import { MPT_FLAG_INFO, calculateFlagsValue, MPTFlagsState } from "@/lib/mptFlags";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface Step3PropertiesProps {
  standard: TokenStandard;
  draft: TokenDraft;
  onUpdate: (updates: Partial<TokenDraft>) => void;
}

export const Step3Properties: React.FC<Step3PropertiesProps> = ({
  standard,
  draft,
  onUpdate,
}) => {
  // Calculate MPT flags value
  const mptFlagsValue = useMemo(() => {
    if (standard !== "MPT") return null;
    const flagsState: MPTFlagsState = {
      canLock: draft.canLock,
      requireAuth: draft.requireAuth,
      canEscrow: draft.canEscrow,
      canTrade: draft.canTrade,
      canTransfer: draft.canTransfer,
      canClawback: draft.canClawback,
    };
    return calculateFlagsValue(flagsState);
  }, [standard, draft.canLock, draft.requireAuth, draft.canEscrow, draft.canTrade, draft.canTransfer, draft.canClawback]);

  const handleFlagToggle = (key: keyof MPTFlagsState, value: boolean) => {
    onUpdate({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Token Properties</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the properties for your {standard} token
        </p>
      </div>

      {/* Common Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Token Name *</Label>
          <Input
            id="name"
            value={draft.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g., Maple Street Residences"
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol *</Label>
          <Input
            id="symbol"
            value={draft.symbol}
            onChange={(e) => onUpdate({ symbol: e.target.value.toUpperCase() })}
            placeholder="e.g., MAPLE"
            maxLength={12}
            className="bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={draft.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Brief description of this token..."
          className="bg-background min-h-20"
        />
      </div>

      {standard !== "NFT" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="decimals">Asset Scale (Decimals)</Label>
            <Input
              id="decimals"
              type="number"
              value={draft.decimals}
              onChange={(e) => onUpdate({ decimals: parseInt(e.target.value) || 0 })}
              min={0}
              max={15}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">0-15 for MPT (determines smallest unit)</p>
          </div>
        </div>
      )}

      <Separator />

      {/* MPT-Specific Fields */}
      {standard === "MPT" && (
        <div className="space-y-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Basic Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxSupply">Maximum Supply</Label>
                <Input
                  id="maxSupply"
                  type="number"
                  value={draft.maxSupply || ""}
                  onChange={(e) => onUpdate({ maxSupply: parseInt(e.target.value) || undefined })}
                  placeholder="Leave empty for unlimited"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferFee">Transfer Fee (%)</Label>
                <Input
                  id="transferFee"
                  type="number"
                  step="0.01"
                  value={draft.transferFee || ""}
                  onChange={(e) => onUpdate({ transferFee: parseFloat(e.target.value) || undefined })}
                  placeholder="0"
                  className="bg-background"
                  disabled={!draft.canTransfer}
                />
                {!draft.canTransfer && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" /> Enable "Can Transfer" to set a fee
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Token Flags */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground">Token Flags</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure XRPL MPT issuance flags
                </p>
              </div>
              {mptFlagsValue && (
                <Badge variant="outline" className="font-mono text-xs">
                  Flags: {mptFlagsValue.decimal} ({mptFlagsValue.hex})
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MPT_FLAG_INFO.map((flag) => (
                <MPTFlagCard
                  key={flag.key}
                  flag={flag}
                  enabled={draft[flag.key] as boolean}
                  onToggle={(value) => handleFlagToggle(flag.key, value)}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* XLS-89 Metadata */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">XLS-89 Metadata</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                On-ledger metadata stored in MPTokenMetadata (optional)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="xls89Metadata">Metadata JSON</Label>
              <Textarea
                id="xls89Metadata"
                value={draft.xls89Metadata}
                onChange={(e) => onUpdate({ xls89Metadata: e.target.value })}
                placeholder='{"t":"MAPLE","n":"Maple Street Residences","d":"...","ac":"rwa_re","as":"sfr"}'
                className="bg-background font-mono text-xs min-h-24"
              />
              <p className="text-xs text-muted-foreground">
                XLS-89 keys: t (code), n (name), d (description), i (image), ac (asset class), as (subclass), in (issuer)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* IOU-Specific Fields */}
      {standard === "IOU" && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">IOU Properties</h3>

          <div className="space-y-2">
            <Label htmlFor="currencyCode">Currency Code *</Label>
            <Input
              id="currencyCode"
              value={draft.currencyCode}
              onChange={(e) => onUpdate({ currencyCode: e.target.value.toUpperCase() })}
              placeholder="e.g., USD, EUR, aUSD"
              maxLength={3}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">3-character ISO code or custom identifier</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="trustline" className="text-sm">Trustline Auth</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Require authorization
                </p>
              </div>
              <Switch
                id="trustline"
                checked={draft.trustlineAuthRequired}
                onCheckedChange={(checked) => onUpdate({ trustlineAuthRequired: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="freeze" className="text-sm">Freeze Enabled</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow freezing accounts
                </p>
              </div>
              <Switch
                id="freeze"
                checked={draft.freezeEnabled}
                onCheckedChange={(checked) => onUpdate({ freezeEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="rippling" className="text-sm">Rippling</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow token rippling
                </p>
              </div>
              <Switch
                id="rippling"
                checked={draft.ripplingAllowed}
                onCheckedChange={(checked) => onUpdate({ ripplingAllowed: checked })}
              />
            </div>
          </div>
        </div>
      )}

      {/* NFT-Specific Fields */}
      {standard === "NFT" && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">NFT Properties (XLS-20)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxon">Taxon</Label>
              <Input
                id="taxon"
                type="number"
                value={draft.taxon}
                onChange={(e) => onUpdate({ taxon: parseInt(e.target.value) || 0 })}
                min={0}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">Collection identifier</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nftTransferFee">Transfer Fee (%)</Label>
              <Input
                id="nftTransferFee"
                type="number"
                step="0.01"
                value={draft.transferFee || ""}
                onChange={(e) => onUpdate({ transferFee: parseFloat(e.target.value) || undefined })}
                placeholder="0"
                max={50}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadataUri">Metadata URI</Label>
            <Input
              id="metadataUri"
              value={draft.metadataUri}
              onChange={(e) => onUpdate({ metadataUri: e.target.value })}
              placeholder="ipfs://... or https://..."
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="burnable" className="text-sm">Burnable</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow holder to burn
                </p>
              </div>
              <Switch
                id="burnable"
                checked={draft.burnable}
                onCheckedChange={(checked) => onUpdate({ burnable: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="onlyXRP" className="text-sm">Only XRP</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Only accept XRP offers
                </p>
              </div>
              <Switch
                id="onlyXRP"
                checked={draft.onlyXRP}
                onCheckedChange={(checked) => onUpdate({ onlyXRP: checked })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
