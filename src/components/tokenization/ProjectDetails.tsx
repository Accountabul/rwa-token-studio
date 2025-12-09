import React from "react";
import { TokenizationProject, Role, statusOrder } from "@/types/tokenization";
import { StatusBadge } from "./StatusBadge";
import { StatusStepper } from "./StatusStepper";
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
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

interface ProjectDetailsProps {
  project: TokenizationProject;
  role: Role;
  onUpdate: (updates: Partial<TokenizationProject>) => void;
  onAdvanceStatus: () => void;
  canAdvance: boolean;
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

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  role,
  onUpdate,
  onAdvanceStatus,
  canAdvance,
}) => {
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
      const parsed = JSON.parse(project.xls89Metadata);
      console.log("Ready to mint with:", parsed);
      toast.success("Mint simulation successful", {
        description: "MPTokenIssuanceCreate would be triggered in production"
      });
    } catch {
      toast.error("Cannot simulate mint", {
        description: "Fix XLS-89 JSON first"
      });
    }
  };

  return (
    <section className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin animate-fade-in">
      {/* Summary Card */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {project.name}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                {project.issuerName || "Issuer not set"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {project.jurisdiction}
              </span>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                {project.assetClass}/{project.assetSubclass}
              </span>
            </div>
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <DollarSign className="w-4 h-4 text-primary" />
              ${project.valuationUsd.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground">
                as of {project.valuationDate}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusBadge status={project.status} />
            <button
              disabled={!canAdvance}
              onClick={onAdvanceStatus}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold border shadow-sm transition-all duration-200",
                canAdvance
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-glow"
                  : "bg-muted text-muted-foreground border-border cursor-not-allowed"
              )}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Advance Lifecycle
            </button>
            <p className="text-[10px] text-muted-foreground max-w-[180px] text-right">
              Gated by your role ({role.replace(/_/g, " ").toLowerCase()}) and project phase
            </p>
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <StatusStepper current={project.status} />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Project core data */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              Project & Asset Details
            </h4>
          </div>
          <div className="space-y-3">
            <FieldRow
              label="Asset ID"
              value={project.assetId}
              onChange={(v) => onUpdate({ assetId: v })}
            />
            <FieldRow
              label="Issuer Name"
              value={project.issuerName}
              onChange={(v) => onUpdate({ issuerName: v })}
              icon={<Building className="w-3 h-3" />}
            />
            <FieldRow
              label="Jurisdiction"
              value={project.jurisdiction}
              onChange={(v) => onUpdate({ jurisdiction: v })}
              icon={<MapPin className="w-3 h-3" />}
            />
            <FieldRow
              label="Asset Class"
              value={project.assetClass}
              onChange={(v) => onUpdate({ assetClass: v })}
            />
            <FieldRow
              label="Subclass"
              value={project.assetSubclass}
              onChange={(v) => onUpdate({ assetSubclass: v })}
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
          </div>
          <p className="text-[11px] text-muted-foreground pt-2 border-t border-border flex items-start gap-2">
            <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
            These fields feed into both your off-chain metadata record and the XLS-89 metadata JSON. AI agents can auto-populate from intake data.
          </p>
        </div>

        {/* XLS-89 editor */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                XLS-89 Metadata
              </h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleValidateJson}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted transition-colors duration-200"
              >
                <CheckCircle2 className="w-3 h-3" />
                Validate
              </button>
              <button
                onClick={handleSimulateMint}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary border border-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              >
                <Sparkles className="w-3 h-3" />
                Simulate Mint
              </button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            This JSON will be hex-encoded and stored in MPTokenMetadata on the XRPL. Keep it under ~1000 bytes and aligned with XLS-89 keys (t, n, d, i, ac, as, in, us, ai).
          </p>
          <textarea
            className="flex-1 min-h-[280px] rounded-xl border border-input bg-muted/50 px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all duration-200 resize-none scrollbar-thin"
            value={project.xls89Metadata}
            onChange={(e) => onUpdate({ xls89Metadata: e.target.value })}
            spellCheck={false}
          />
        </div>
      </div>
    </section>
  );
};
