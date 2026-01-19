import React, { useState, useMemo } from "react";
import { TokenizationProject, Role, statusOrder, assetClassLabel, realEstateSubclassLabel, AssetClass, RealEstateSubclass, MPTConfig } from "@/types/tokenization";
import { StatusBadge } from "./StatusBadge";
import { StatusStepper } from "./StatusStepper";
import { MetadataForm } from "./MetadataForm";
import { TokenLifecyclePanel } from "./TokenLifecyclePanel";
import { PhaseTransitionDialog } from "./PhaseTransitionDialog";
import { PhaseApprovalHistory } from "./PhaseApprovalHistory";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  FileCheck, 
  Sparkles,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  User,
  Home,
  Settings2,
  Coins,
  Calculator,
  Divide,
  Equal,
  Save,
  Trash2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MPT_FLAG_INFO, calculateFlagsValue, MPTFlagsState } from "@/lib/mptFlags";
import { calculatePricePerToken, formatPrice, formatValuation } from "@/lib/pricingCalculator";

interface ProjectDetailsProps {
  project: TokenizationProject;
  role: Role;
  userId?: string;
  userName?: string;
  onUpdate: (updates: Partial<TokenizationProject>) => void;
  onSave: () => void;
  onDelete: () => void;
  onAdvanceStatus: () => void;
  canAdvance: boolean;
  canDelete: boolean;
}

interface FieldRowProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "date";
  icon?: React.ReactNode;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, value, onChange, type = "text", icon }) => (
  <div className="grid grid-cols-3 gap-3 items-center">
    <label className="text-xs text-muted-foreground flex items-center gap-2">
      {icon}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all duration-200"
    />
  </div>
);

interface SelectFieldRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}

const SelectFieldRow: React.FC<SelectFieldRowProps> = ({ label, value, onChange, options, icon }) => (
  <div className="grid grid-cols-3 gap-3 items-center">
    <label className="text-xs text-muted-foreground flex items-center gap-2">
      {icon}
      {label}
    </label>
    <div className="col-span-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-xs">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

// Build options from the taxonomy
const assetClassOptions = Object.entries(assetClassLabel).map(([value, label]) => ({
  value,
  label,
}));

const subclassOptions = Object.entries(realEstateSubclassLabel).map(([value, label]) => ({
  value,
  label,
}));

// Token Fractionalization Section Component
interface TokenFractionalizationSectionProps {
  project: TokenizationProject;
  onUpdate: (updates: Partial<TokenizationProject>) => void;
}

const TokenFractionalizationSection: React.FC<TokenFractionalizationSectionProps> = ({ project, onUpdate }) => {
  const tokenSupply = project.mptConfig?.maxSupply || project.plannedTokenSupply || 0;
  const isMinted = project.status === "MINTED";
  
  const pricePerToken = useMemo(() => {
    if (project.valuationUsd > 0 && tokenSupply > 0) {
      return calculatePricePerToken(project.valuationUsd, tokenSupply);
    }
    return 0;
  }, [project.valuationUsd, tokenSupply]);

  const formattedValuation = formatValuation(project.valuationUsd);
  const formattedSupply = tokenSupply >= 1000000 
    ? `${(tokenSupply / 1000000).toFixed(1)}M` 
    : tokenSupply >= 1000 
      ? `${(tokenSupply / 1000).toFixed(0)}K`
      : tokenSupply.toLocaleString();

  return (
    <>
      <div className="border-t border-border pt-3 mt-3" />
      <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
        <Calculator className="w-3.5 h-3.5 text-primary" />
        Token Fractionalization
      </h5>
      
      {/* Token Supply Input */}
      <div className="grid grid-cols-3 gap-3 items-center">
        <label className="text-xs text-muted-foreground flex items-center gap-2">
          <Coins className="w-3 h-3" />
          Total Token Supply
        </label>
        {isMinted ? (
          <div className="col-span-2 rounded-lg border border-input bg-muted/50 px-3 py-2 text-xs font-medium">
            {tokenSupply.toLocaleString()} <span className="text-muted-foreground">(locked)</span>
          </div>
        ) : (
          <input
            type="number"
            value={project.plannedTokenSupply || ""}
            onChange={(e) => onUpdate({ plannedTokenSupply: Number(e.target.value) || 0 })}
            placeholder="e.g., 1000000"
            className="col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all duration-200"
          />
        )}
      </div>

      {/* Price Per Token Display */}
      <div className="grid grid-cols-3 gap-3 items-center">
        <label className="text-xs text-muted-foreground flex items-center gap-2">
          <DollarSign className="w-3 h-3" />
          Price Per Token
        </label>
        <div className="col-span-2 rounded-lg border border-input bg-muted/50 px-3 py-2 text-xs font-semibold text-primary">
          {pricePerToken > 0 ? formatPrice(pricePerToken, "USD") : "—"}
        </div>
      </div>

      {/* Visual Price Calculator Card */}
      {project.valuationUsd > 0 && tokenSupply > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-foreground">Price Calculation</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex flex-col items-center">
              <span className="font-bold text-foreground">{formattedValuation}</span>
              <span className="text-[10px] text-muted-foreground">Valuation</span>
            </div>
            <Divide className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <span className="font-bold text-foreground">{formattedSupply}</span>
              <span className="text-[10px] text-muted-foreground">Tokens</span>
            </div>
            <Equal className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <span className="font-bold text-primary">{formatPrice(pricePerToken, "USD")}</span>
              <span className="text-[10px] text-muted-foreground">Per Token</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  role,
  userId = "mock-user-id",
  userName = "Current User",
  onUpdate,
  onSave,
  onDelete,
  onAdvanceStatus,
  canAdvance,
  canDelete,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);

  // Get next status in sequence
  const currentIndex = statusOrder.indexOf(project.status);
  const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;

  const handleValidateJson = () => {
    try {
      const parsed = JSON.parse(project.xls89Metadata);
      console.log("XLS-89 metadata parsed successfully", parsed);
      toast.success("XLS-89 metadata is valid JSON", {
        description: "Ready for on-ledger encoding"
      });
    } catch {
      toast.error("Invalid JSON format", {
        description: "Please fix syntax errors before minting"
      });
    }
  };

  const handleSimulateMint = () => {
    try {
      JSON.parse(project.xls89Metadata);
      toast.success("Mint simulation successful", {
        description: "MPTokenIssuanceCreate would be triggered in production"
      });
    } catch {
      toast.error("Cannot simulate mint", {
        description: "Fix XLS-89 metadata first"
      });
    }
  };

  const handleAdvanceClick = () => {
    setShowTransitionDialog(true);
  };

  const handleTransitionComplete = (success: boolean, completed: boolean) => {
    if (success && completed) {
      toast.success("Phase advanced successfully", {
        description: "The project has moved to the next phase"
      });
      onAdvanceStatus(); // Trigger parent refresh
    } else if (success && !completed) {
      toast.info("Approval recorded", {
        description: "Waiting for additional approvals to complete the transition"
      });
    }
  };

  return (
    <section className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin animate-fade-in">
      {/* Summary Card */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            {/* Property Address as Primary */}
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-foreground">
                {project.propertyAddress || project.name}
              </h3>
            </div>
            
            {/* Owner and Property Nickname */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground ml-7">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {project.ownerName || "Owner not set"}
              </span>
              {project.propertyNickname && (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {project.propertyNickname}
                </span>
              )}
            </div>

            {/* Secondary Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground ml-7">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                {project.companyName || "Company not set"}
              </span>
              <span className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                {project.jurisdiction}
              </span>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                {realEstateSubclassLabel[project.assetSubclass] || project.assetSubclass}
              </span>
            </div>

            <p className="flex items-center gap-2 text-sm font-semibold text-foreground ml-7">
              <DollarSign className="w-4 h-4 text-primary" />
              ${project.valuationUsd.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground">
                as of {project.valuationDate}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusBadge status={project.status} />
            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold border border-border bg-background text-foreground hover:bg-muted transition-all duration-200"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
              {nextStatus && (
                <button
                  disabled={!canAdvance}
                  onClick={handleAdvanceClick}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold border shadow-sm transition-all duration-200",
                    canAdvance
                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-glow"
                      : "bg-muted text-muted-foreground border-border cursor-not-allowed"
                  )}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Advance Phase
                </button>
              )}
            </div>
            {canDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <Trash2 className="w-3 h-3" />
                Delete Project
              </button>
            )}
            <p className="text-[10px] text-muted-foreground max-w-[180px] text-right">
              Phase advancement requires role-based approval
            </p>
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <StatusStepper current={project.status} />
        </div>
      </div>

      {/* Phase Approval History */}
      <PhaseApprovalHistory projectId={project.id} />


      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Project core data */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              Property & Asset Details
            </h4>
          </div>
          <div className="space-y-3">
            <FieldRow
              label="Property Address"
              value={project.propertyAddress || ""}
              onChange={(v) => onUpdate({ propertyAddress: v })}
              icon={<MapPin className="w-3 h-3" />}
            />
            <FieldRow
              label="Owner Name"
              value={project.ownerName || ""}
              onChange={(v) => onUpdate({ ownerName: v })}
              icon={<User className="w-3 h-3" />}
            />
            <FieldRow
              label="Property Nickname"
              value={project.propertyNickname || ""}
              onChange={(v) => onUpdate({ propertyNickname: v })}
              icon={<Home className="w-3 h-3" />}
            />
            <div className="border-t border-border pt-3 mt-3" />
            <FieldRow
              label="Asset ID"
              value={project.assetId}
              onChange={(v) => onUpdate({ assetId: v })}
            />
            <FieldRow
              label="Company Name"
              value={project.companyName}
              onChange={(v) => onUpdate({ companyName: v })}
              icon={<Building className="w-3 h-3" />}
            />
            <FieldRow
              label="Jurisdiction"
              value={project.jurisdiction}
              onChange={(v) => onUpdate({ jurisdiction: v })}
            />
            <SelectFieldRow
              label="Asset Class"
              value={project.assetClass}
              onChange={(v) => onUpdate({ assetClass: v as AssetClass })}
              options={assetClassOptions}
            />
            <SelectFieldRow
              label="Subclass"
              value={project.assetSubclass}
              onChange={(v) => onUpdate({ assetSubclass: v as RealEstateSubclass })}
              options={subclassOptions}
            />
            <FieldRow
              label="Valuation (USD)"
              value={project.valuationUsd}
              type="number"
              onChange={(v) => onUpdate({ valuationUsd: Number(v) || 0 })}
              icon={<DollarSign className="w-3 h-3" />}
            />
            <FieldRow
              label="Valuation Date"
              value={project.valuationDate}
              type="date"
              onChange={(v) => onUpdate({ valuationDate: v })}
              icon={<Calendar className="w-3 h-3" />}
            />
            
            {/* Token Fractionalization Section */}
            <TokenFractionalizationSection project={project} onUpdate={onUpdate} />
          </div>
          <p className="text-[11px] text-muted-foreground pt-2 border-t border-border flex items-start gap-2">
            <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
            Property details are the primary way to identify assets. Technical IDs are generated automatically.
          </p>
        </div>

        {/* XLS-89 Form Editor */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Token Metadata
              </h4>
            </div>
            <button
              onClick={handleSimulateMint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary border border-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
            >
              <Sparkles className="w-3 h-3" />
              Simulate Mint
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">
            Configure how this asset will appear on the XRPL blockchain. Character limits ensure the metadata fits within on-ledger constraints.
          </p>
          
          {/* Form-based editor */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <MetadataForm
              metadata={project.xls89Metadata}
              onChange={(m) => onUpdate({ xls89Metadata: m })}
            />
          </div>

          {/* Advanced: Raw JSON */}
          <Collapsible open={showRawJson} onOpenChange={setShowRawJson} className="mt-4 pt-4 border-t border-border">
            <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-between">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3 h-3" />
                Advanced: View Raw JSON
              </span>
              {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handleValidateJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted transition-colors duration-200"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Validate JSON
                </button>
              </div>
              <textarea
                className="w-full min-h-[200px] rounded-xl border border-input bg-muted/50 px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all duration-200 resize-none scrollbar-thin"
                value={project.xls89Metadata}
                onChange={(e) => onUpdate({ xls89Metadata: e.target.value })}
                spellCheck={false}
              />
              <p className="text-[10px] text-muted-foreground">
                This JSON will be hex-encoded and stored in MPTokenMetadata on the XRPL. Keep it under ~1000 bytes.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Token Lifecycle Panel - Only shown when MINTED */}
      {project.status === "MINTED" && (
        <TokenLifecyclePanel
          projectId={project.id}
          role={role}
          mptFlags={project.mptConfig?.flags || {
            canLock: true,
            requireAuth: true,
            canEscrow: true,
            canTrade: true,
            canTransfer: true,
            canClawback: true,
          }}
        />
      )}

      {/* Phase Transition Dialog */}
      {nextStatus && (
        <PhaseTransitionDialog
          open={showTransitionDialog}
          onOpenChange={setShowTransitionDialog}
          projectId={project.id}
          projectName={project.propertyAddress || project.name}
          fromStatus={project.status}
          toStatus={nextStatus}
          userId={userId}
          userName={userName}
          userRole={role}
          onTransitionComplete={handleTransitionComplete}
        />
      )}
    </section>
  );
};
