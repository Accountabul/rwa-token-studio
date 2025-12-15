import React from "react";
import { TokenStandard, tokenStandardLabel } from "@/types/token";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Banknote, Hexagon, Image } from "lucide-react";

interface Step1TokenTypeProps {
  selected?: TokenStandard;
  onSelect: (standard: TokenStandard) => void;
}

const tokenTypes: { standard: TokenStandard; icon: React.ReactNode; description: string; xls: string }[] = [
  {
    standard: "IOU",
    icon: <Banknote className="h-8 w-8" />,
    description: "Trustline-based tokens for fungible assets. Supports freeze, authorization, and rippling controls.",
    xls: "Native XRPL",
  },
  {
    standard: "MPT",
    icon: <Hexagon className="h-8 w-8" />,
    description: "Multi-Purpose Tokens for RWA tokenization. Supports clawback, escrow, and on-ledger metadata.",
    xls: "XLS-89",
  },
  {
    standard: "NFT",
    icon: <Image className="h-8 w-8" />,
    description: "Non-Fungible Tokens for unique assets. Supports transfer fees, burning, and metadata URIs.",
    xls: "XLS-20",
  },
];

export const Step1TokenType: React.FC<Step1TokenTypeProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Select Token Standard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the XRPL token standard that best fits your use case
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tokenTypes.map((type) => (
          <Card
            key={type.standard}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selected === type.standard
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "bg-card border-border"
            )}
            onClick={() => onSelect(type.standard)}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "p-3 rounded-lg",
                    selected === type.standard ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {type.icon}
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                  {type.xls}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-foreground">{tokenStandardLabel[type.standard]}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{type.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
