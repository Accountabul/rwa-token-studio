import React from "react";
import { TokenStandard } from "@/types/token";
import { TokenDraft } from "./TokenWizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

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
            <Label htmlFor="decimals">Decimals</Label>
            <Input
              id="decimals"
              type="number"
              value={draft.decimals}
              onChange={(e) => onUpdate({ decimals: parseInt(e.target.value) || 0 })}
              min={0}
              max={18}
              className="bg-background"
            />
          </div>
        </div>
      )}

      <Separator />

      {/* MPT-Specific Fields */}
      {standard === "MPT" && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">MPT Properties (XLS-89)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxSupply">Max Supply</Label>
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="clawback" className="text-sm">Clawback Enabled</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow issuer to reclaim tokens
                </p>
              </div>
              <Switch
                id="clawback"
                checked={draft.clawbackEnabled}
                onCheckedChange={(checked) => onUpdate({ clawbackEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="escrow" className="text-sm">Escrow Enabled</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow token escrow operations
                </p>
              </div>
              <Switch
                id="escrow"
                checked={draft.escrowEnabled}
                onCheckedChange={(checked) => onUpdate({ escrowEnabled: checked })}
              />
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
