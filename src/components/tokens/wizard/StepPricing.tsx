import React, { useMemo } from "react";
import { TokenDraft } from "./TokenWizard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Scale, 
  Layers,
  AlertTriangle,
  Clock
} from "lucide-react";
import {
  ValuationMethod,
  TokenClass,
  PricingMode,
  PricingCurrency,
  valuationMethodLabel,
  tokenClassLabel,
  pricingCurrencyLabel,
} from "@/types/tokenPricing";
import {
  calculatePricePerToken,
  calculatePriceDeviation,
  generateDeviationWarning,
  requiresDeviationAcknowledgment,
  formatPrice,
} from "@/lib/pricingCalculator";
import { PriceCalculatorDisplay } from "./PriceCalculatorDisplay";
import { PricingModeCard } from "./PricingModeCard";
import { PriceDeviationBadge } from "./PriceDeviationBadge";

interface StepPricingProps {
  draft: TokenDraft;
  onUpdate: (updates: Partial<TokenDraft>) => void;
}

export const StepPricing: React.FC<StepPricingProps> = ({ draft, onUpdate }) => {
  // Calculate fair value price in real-time
  const fairValuePrice = useMemo(() => {
    return calculatePricePerToken(
      draft.assetValuationUsd || 0,
      draft.maxSupply || 0
    );
  }, [draft.assetValuationUsd, draft.maxSupply]);

  // Calculate deviation if issuer-defined price exists
  const deviation = useMemo(() => {
    if (draft.pricingMode === "FAIR_VALUE" || !draft.issuerDefinedPrice) {
      return 0;
    }
    return calculatePriceDeviation(fairValuePrice, draft.issuerDefinedPrice);
  }, [fairValuePrice, draft.issuerDefinedPrice, draft.pricingMode]);

  const deviationWarning = useMemo(() => {
    return generateDeviationWarning(deviation);
  }, [deviation]);

  const needsAcknowledgment = useMemo(() => {
    return requiresDeviationAcknowledgment(deviation);
  }, [deviation]);

  // Update fair value when calculated
  React.useEffect(() => {
    if (fairValuePrice !== draft.fairValuePrice) {
      onUpdate({ fairValuePrice });
    }
  }, [fairValuePrice, draft.fairValuePrice, onUpdate]);

  const handleValuationChange = (value: string) => {
    const numValue = parseFloat(value.replace(/,/g, "")) || 0;
    onUpdate({ assetValuationUsd: numValue });
  };

  const handleSupplyChange = (value: string) => {
    const numValue = parseInt(value.replace(/,/g, ""), 10) || 0;
    onUpdate({ maxSupply: numValue });
  };

  const handleIssuerPriceChange = (value: string) => {
    const numValue = parseFloat(value.replace(/,/g, "")) || 0;
    onUpdate({ 
      issuerDefinedPrice: numValue,
      deviationAcknowledged: false // Reset acknowledgment when price changes
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-foreground">Valuation & Pricing</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure asset valuation and token pricing for transparent issuance
        </p>
      </div>

      {/* Section 1: Asset Valuation */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-foreground">Asset Valuation</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valuation">Asset Valuation (USD) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="valuation"
                type="text"
                placeholder="4,500,000"
                value={draft.assetValuationUsd?.toLocaleString() || ""}
                onChange={(e) => handleValuationChange(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valuationMethod">Valuation Method *</Label>
            <Select
              value={draft.valuationMethod}
              onValueChange={(value: ValuationMethod) => onUpdate({ valuationMethod: value })}
            >
              <SelectTrigger id="valuationMethod">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(valuationMethodLabel).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valuationSource">Valuation Source Reference (Optional)</Label>
          <Input
            id="valuationSource"
            type="text"
            placeholder="https://appraisal-firm.com/report/12345"
            value={draft.valuationSourceRef || ""}
            onChange={(e) => onUpdate({ valuationSourceRef: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Valuation timestamp will be recorded automatically at issuance</span>
        </div>
      </div>

      <Separator />

      {/* Section 2: Token Supply */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-foreground">Token Supply Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalSupply">Total Token Supply *</Label>
            <Input
              id="totalSupply"
              type="text"
              placeholder="1,000,000"
              value={draft.maxSupply?.toLocaleString() || ""}
              onChange={(e) => handleSupplyChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenClass">Token Class *</Label>
            <Select
              value={draft.tokenClass}
              onValueChange={(value: TokenClass) => onUpdate({ tokenClass: value })}
            >
              <SelectTrigger id="tokenClass">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tokenClassLabel).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section 3: Price Calculator Display */}
      <PriceCalculatorDisplay
        valuationUsd={draft.assetValuationUsd || 0}
        totalSupply={draft.maxSupply || 0}
        pricePerToken={fairValuePrice}
        currency={draft.pricingCurrency || "USD"}
      />

      <Separator />

      {/* Section 4: Pricing Mode */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-foreground">Pricing Mode</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PricingModeCard
            mode="FAIR_VALUE"
            title="Fair Value"
            description="Price derived strictly from asset valuation divided by supply. No manual overrides."
            isSelected={draft.pricingMode === "FAIR_VALUE"}
            onSelect={() => onUpdate({ pricingMode: "FAIR_VALUE", issuerDefinedPrice: undefined })}
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
          />
          <PricingModeCard
            mode="ISSUER_DEFINED"
            title="Issuer-Defined"
            description="You set the listing price. System shows deviation from fair value."
            isSelected={draft.pricingMode === "ISSUER_DEFINED"}
            onSelect={() => onUpdate({ pricingMode: "ISSUER_DEFINED" })}
            icon={<DollarSign className="h-4 w-4 text-primary" />}
          />
          <PricingModeCard
            mode="HYBRID_DISCLOSURE"
            title="Hybrid Disclosure"
            description="Display both fair value and issuer price for full transparency."
            isSelected={draft.pricingMode === "HYBRID_DISCLOSURE"}
            onSelect={() => onUpdate({ pricingMode: "HYBRID_DISCLOSURE" })}
            icon={<FileText className="h-4 w-4 text-primary" />}
          />
        </div>
      </div>

      {/* Section 5: Issuer-Defined Price (conditional) */}
      {draft.pricingMode !== "FAIR_VALUE" && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-foreground">Issuer-Defined Price</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issuerPrice">Listing Price Per Token *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="issuerPrice"
                    type="text"
                    placeholder="5.00"
                    value={draft.issuerDefinedPrice?.toFixed(2) || ""}
                    onChange={(e) => handleIssuerPriceChange(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deviation from Fair Value</Label>
                <div className="flex items-center h-10">
                  {draft.issuerDefinedPrice ? (
                    <div className="flex items-center gap-3">
                      <PriceDeviationBadge deviationPercent={deviation} />
                      <span className="text-sm text-muted-foreground">
                        Fair value: {formatPrice(fairValuePrice, draft.pricingCurrency || "USD")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Enter a price to see deviation</span>
                  )}
                </div>
              </div>
            </div>

            {/* Deviation Warning */}
            {deviationWarning && (
              <Alert variant={needsAcknowledgment ? "destructive" : "default"} className="bg-amber-500/5 border-amber-500/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{deviationWarning}</AlertDescription>
              </Alert>
            )}

            {/* Acknowledgment checkbox for high deviation */}
            {needsAcknowledgment && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <Checkbox
                  id="deviationAck"
                  checked={draft.deviationAcknowledged || false}
                  onCheckedChange={(checked) => onUpdate({ deviationAcknowledged: checked === true })}
                />
                <Label htmlFor="deviationAck" className="text-sm leading-relaxed cursor-pointer">
                  I acknowledge that the issuer-defined price significantly deviates from fair value 
                  and I understand this may require additional disclosure to investors.
                </Label>
              </div>
            )}
          </div>
        </>
      )}

      <Separator />

      {/* Section 6: Currency Selection */}
      <div className="space-y-4">
        <Label>Denomination Currency</Label>
        <RadioGroup
          value={draft.pricingCurrency || "USD"}
          onValueChange={(value: PricingCurrency) => onUpdate({ pricingCurrency: value })}
          className="flex gap-4"
        >
          {Object.entries(pricingCurrencyLabel).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <RadioGroupItem value={key} id={`currency-${key}`} />
              <Label htmlFor={`currency-${key}`} className="cursor-pointer font-normal">
                {label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};
