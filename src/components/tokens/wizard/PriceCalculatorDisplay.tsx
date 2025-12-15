import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ArrowRight, Divide, Coins } from "lucide-react";
import { formatPrice, formatValuation } from "@/lib/pricingCalculator";
import { PricingCurrency } from "@/types/tokenPricing";
import { cn } from "@/lib/utils";

interface PriceCalculatorDisplayProps {
  valuationUsd: number;
  totalSupply: number;
  pricePerToken: number;
  currency: PricingCurrency;
}

export const PriceCalculatorDisplay: React.FC<PriceCalculatorDisplayProps> = ({
  valuationUsd,
  totalSupply,
  pricePerToken,
  currency,
}) => {
  const isValid = valuationUsd > 0 && totalSupply > 0;

  return (
    <Card className={cn(
      "border-2 transition-all duration-300",
      isValid 
        ? "border-primary/30 bg-primary/5" 
        : "border-border bg-muted/30"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Price Per Token</h3>
        </div>

        {isValid ? (
          <div className="space-y-4">
            {/* Calculation Formula */}
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <div className="text-center">
                <p className="text-xs uppercase tracking-wide mb-1">Valuation</p>
                <p className="font-semibold text-foreground">{formatValuation(valuationUsd)}</p>
              </div>
              <Divide className="h-4 w-4 flex-shrink-0" />
              <div className="text-center">
                <p className="text-xs uppercase tracking-wide mb-1">Supply</p>
                <p className="font-semibold text-foreground">{totalSupply.toLocaleString()}</p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
              <div className="text-center">
                <p className="text-xs uppercase tracking-wide mb-1">Price</p>
                <p className="font-bold text-primary text-lg">
                  {formatPrice(pricePerToken, currency, pricePerToken < 1 ? 4 : 2)}
                </p>
              </div>
            </div>

            {/* Visual Price Bar */}
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                style={{ width: "100%" }}
              />
            </div>

            {/* Token Summary */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Each token represents
              </span>
              <span className="font-medium text-foreground">
                {((1 / totalSupply) * 100).toFixed(6)}%
              </span>
              <span className="text-muted-foreground">of the asset</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Enter valuation and supply to calculate price</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
