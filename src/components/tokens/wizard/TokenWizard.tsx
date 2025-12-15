import React, { useState } from "react";
import { TokenStandard, Token, TokenCompliance, IssuingWallet } from "@/types/token";
import { Role } from "@/types/tokenization";
import { mockWallets } from "@/data/mockWallets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Step1TokenType } from "./Step1TokenType";
import { Step2WalletConfig } from "./Step2WalletConfig";
import { Step3Properties } from "./Step3Properties";
import { Step4Compliance } from "./Step4Compliance";
import { Step5Review } from "./Step5Review";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface TokenWizardProps {
  role: Role;
}

export interface TokenDraft {
  standard?: TokenStandard;
  wallet?: IssuingWallet;
  name: string;
  symbol: string;
  description: string;
  decimals: number;
  maxSupply?: number;
  transferFee?: number;
  // MPT specific flags
  canLock: boolean;
  requireAuth: boolean;
  canEscrow: boolean;
  canTrade: boolean;
  canTransfer: boolean;
  canClawback: boolean;
  xls89Metadata: string;
  // Legacy MPT (keep for backward compatibility)
  clawbackEnabled: boolean;
  escrowEnabled: boolean;
  // IOU specific
  currencyCode: string;
  trustlineAuthRequired: boolean;
  freezeEnabled: boolean;
  ripplingAllowed: boolean;
  // NFT specific
  taxon: number;
  burnable: boolean;
  onlyXRP: boolean;
  metadataUri: string;
  // Compliance
  compliance: TokenCompliance;
}

const initialDraft: TokenDraft = {
  name: "",
  symbol: "",
  description: "",
  decimals: 6,
  // MPT flags - defaults for RWA tokens
  canLock: true,
  requireAuth: true,
  canEscrow: true,
  canTrade: false,
  canTransfer: true,
  canClawback: true,
  xls89Metadata: "",
  // Legacy
  clawbackEnabled: true,
  escrowEnabled: true,
  // IOU
  currencyCode: "",
  trustlineAuthRequired: true,
  freezeEnabled: true,
  ripplingAllowed: false,
  // NFT
  taxon: 0,
  burnable: false,
  onlyXRP: false,
  metadataUri: "",
  compliance: {
    jurisdictions: [],
    kycRequired: true,
    accreditationRequired: false,
    permissionDexEnforced: true,
  },
};

const steps = [
  { id: 1, name: "Token Type" },
  { id: 2, name: "Wallet" },
  { id: 3, name: "Properties" },
  { id: 4, name: "Compliance" },
  { id: 5, name: "Review" },
];

export const TokenWizard: React.FC<TokenWizardProps> = ({ role }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<TokenDraft>(initialDraft);
  const wallets = mockWallets;

  const updateDraft = (updates: Partial<TokenDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!draft.standard;
      case 2:
        return !!draft.wallet && draft.wallet.isAuthorized && draft.wallet.permissionDexStatus === "APPROVED";
      case 3:
        return draft.name.trim() !== "" && draft.symbol.trim() !== "";
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleIssue = () => {
    toast({
      title: "Token Created",
      description: `${draft.name} (${draft.symbol}) has been submitted for issuance.`,
    });
    navigate("/tokens");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1TokenType
            selected={draft.standard}
            onSelect={(standard) => updateDraft({ standard })}
          />
        );
      case 2:
        return (
          <Step2WalletConfig
            wallets={wallets}
            selected={draft.wallet}
            onSelect={(wallet) => updateDraft({ wallet })}
          />
        );
      case 3:
        return (
          <Step3Properties
            standard={draft.standard!}
            draft={draft}
            onUpdate={updateDraft}
          />
        );
      case 4:
        return (
          <Step4Compliance
            compliance={draft.compliance}
            onUpdate={(compliance) => updateDraft({ compliance })}
          />
        );
      case 5:
        return <Step5Review draft={draft} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tokens")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Create New Token</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Step {currentStep} of 5: {steps[currentStep - 1].name}
          </p>
        </div>
      </div>

      {/* Progress Steps - Clickable */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors cursor-pointer hover:ring-2 hover:ring-primary/50 ${
                currentStep > step.id
                  ? "bg-primary text-primary-foreground"
                  : currentStep === step.id
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              title={step.name}
            >
              {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
            </button>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">{renderStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {currentStep < 5 ? (
          <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleIssue} disabled={!canProceed()} className="gap-2">
            <Check className="h-4 w-4" />
            Issue Token
          </Button>
        )}
      </div>
    </div>
  );
};
