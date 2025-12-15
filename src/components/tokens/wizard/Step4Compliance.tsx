import React from "react";
import { TokenCompliance } from "@/types/token";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Step4ComplianceProps {
  compliance: TokenCompliance;
  onUpdate: (compliance: TokenCompliance) => void;
}

const commonJurisdictions = ["US", "US-DE", "US-NY", "US-CA", "US-TX", "EU", "UK", "SG", "CH"];

export const Step4Compliance: React.FC<Step4ComplianceProps> = ({ compliance, onUpdate }) => {
  const [newJurisdiction, setNewJurisdiction] = React.useState("");

  const addJurisdiction = (jurisdiction: string) => {
    if (jurisdiction && !compliance.jurisdictions.includes(jurisdiction)) {
      onUpdate({
        ...compliance,
        jurisdictions: [...compliance.jurisdictions, jurisdiction.toUpperCase()],
      });
    }
    setNewJurisdiction("");
  };

  const removeJurisdiction = (jurisdiction: string) => {
    onUpdate({
      ...compliance,
      jurisdictions: compliance.jurisdictions.filter((j) => j !== jurisdiction),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Compliance & Restrictions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define compliance requirements and transfer restrictions
        </p>
      </div>

      <Alert className="bg-amber-500/10 border-amber-500/30">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-amber-200">
          All restrictions must be explicit, not implied. Ensure each setting reflects your compliance requirements.
        </AlertDescription>
      </Alert>

      {/* Jurisdictions */}
      <div className="space-y-3">
        <Label>Jurisdictions</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {compliance.jurisdictions.map((j) => (
            <Badge key={j} variant="secondary" className="gap-1 pr-1">
              {j}
              <button
                onClick={() => removeJurisdiction(j)}
                className="ml-1 hover:bg-muted rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newJurisdiction}
            onChange={(e) => setNewJurisdiction(e.target.value.toUpperCase())}
            placeholder="Add jurisdiction (e.g., US-DE)"
            className="bg-background flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addJurisdiction(newJurisdiction);
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {commonJurisdictions
            .filter((j) => !compliance.jurisdictions.includes(j))
            .slice(0, 6)
            .map((j) => (
              <button
                key={j}
                onClick={() => addJurisdiction(j)}
                className="text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                + {j}
              </button>
            ))}
        </div>
      </div>

      {/* Compliance Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div>
            <Label htmlFor="kyc" className="text-sm font-medium">KYC Required</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Holders must complete KYC verification
            </p>
          </div>
          <Switch
            id="kyc"
            checked={compliance.kycRequired}
            onCheckedChange={(checked) => onUpdate({ ...compliance, kycRequired: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div>
            <Label htmlFor="accreditation" className="text-sm font-medium">Accreditation Required</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Only accredited investors allowed
            </p>
          </div>
          <Switch
            id="accreditation"
            checked={compliance.accreditationRequired}
            onCheckedChange={(checked) => onUpdate({ ...compliance, accreditationRequired: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
          <div>
            <Label htmlFor="pdx" className="text-sm font-medium">PermissionDEX</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Wallet-level verification required
            </p>
          </div>
          <Switch
            id="pdx"
            checked={compliance.permissionDexEnforced}
            onCheckedChange={(checked) => onUpdate({ ...compliance, permissionDexEnforced: checked })}
          />
        </div>
      </div>

      {/* Additional Restrictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lockup">Lockup Period</Label>
          <Input
            id="lockup"
            value={compliance.lockupPeriod || ""}
            onChange={(e) => onUpdate({ ...compliance, lockupPeriod: e.target.value || undefined })}
            placeholder="e.g., 12 months"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Minimum holding period after acquisition
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="restrictions">Transfer Restrictions</Label>
        <Textarea
          id="restrictions"
          value={compliance.transferRestrictions || ""}
          onChange={(e) => onUpdate({ ...compliance, transferRestrictions: e.target.value || undefined })}
          placeholder="Describe any additional transfer restrictions..."
          className="bg-background min-h-20"
        />
        <p className="text-xs text-muted-foreground">
          Declarative description of transfer limitations (e.g., "Accredited investors only")
        </p>
      </div>
    </div>
  );
};
