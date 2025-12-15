import React, { useState, useMemo } from "react";
import { TokenDraft } from "./TokenWizard";
import { tokenStandardLabel } from "@/types/token";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Wallet, 
  FileText, 
  Shield, 
  Coins,
  ChevronDown,
  ChevronUp,
  Flag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateFlagsValue, MPT_FLAG_INFO, MPTFlagsState } from "@/lib/mptFlags";

interface Step5ReviewProps {
  draft: TokenDraft;
}

export const Step5Review: React.FC<Step5ReviewProps> = ({ draft }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["token", "wallet", "properties", "flags", "compliance"]);

  // Calculate MPT flags value for display
  const mptFlagsValue = useMemo(() => {
    if (draft.standard !== "MPT") return null;
    const flagsState: MPTFlagsState = {
      canLock: draft.canLock,
      requireAuth: draft.requireAuth,
      canEscrow: draft.canEscrow,
      canTrade: draft.canTrade,
      canTransfer: draft.canTransfer,
      canClawback: draft.canClawback,
    };
    return calculateFlagsValue(flagsState);
  }, [draft]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  const renderBool = (value: boolean) =>
    value ? (
      <span className="flex items-center gap-1 text-emerald-400">
        <CheckCircle className="h-3.5 w-3.5" /> Yes
      </span>
    ) : (
      <span className="flex items-center gap-1 text-muted-foreground">
        <XCircle className="h-3.5 w-3.5" /> No
      </span>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Review & Issue</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your token configuration before issuing on the XRP Ledger
        </p>
      </div>

      {/* Token Summary */}
      <CollapsibleSection
        title="Token Details"
        icon={<Coins className="h-4 w-4" />}
        isExpanded={isExpanded("token")}
        onToggle={() => toggleSection("token")}
      >
        <div className="grid grid-cols-2 gap-3">
          <ReviewItem label="Standard" value={tokenStandardLabel[draft.standard!]} />
          <ReviewItem label="Name" value={draft.name} />
          <ReviewItem label="Symbol" value={draft.symbol} />
          {draft.decimals !== undefined && <ReviewItem label="Decimals" value={draft.decimals.toString()} />}
        </div>
        {draft.description && (
          <div className="mt-3">
            <ReviewItem label="Description" value={draft.description} />
          </div>
        )}
      </CollapsibleSection>

      {/* Wallet */}
      <CollapsibleSection
        title="Issuing Wallet"
        icon={<Wallet className="h-4 w-4" />}
        isExpanded={isExpanded("wallet")}
        onToggle={() => toggleSection("wallet")}
      >
        <div className="space-y-2">
          <ReviewItem label="Wallet Name" value={draft.wallet?.name || "-"} />
          <ReviewItem label="Address" value={draft.wallet?.xrplAddress || "-"} mono />
          <div className="flex gap-4">
            <ReviewItem
              label="Multi-Sign"
              value={
                draft.wallet?.multiSignEnabled
                  ? `${draft.wallet.multiSignQuorum}/${draft.wallet.multiSignSigners}`
                  : "No"
              }
            />
            <ReviewItem label="PermissionDEX" value={draft.wallet?.permissionDexStatus || "-"} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Properties */}
      <CollapsibleSection
        title="Token Properties"
        icon={<FileText className="h-4 w-4" />}
        isExpanded={isExpanded("properties")}
        onToggle={() => toggleSection("properties")}
      >
        {draft.standard === "MPT" && (
          <div className="grid grid-cols-2 gap-3">
            <ReviewItem label="Asset Scale" value={`${draft.decimals} decimals`} />
            <ReviewItem label="Max Supply" value={draft.maxSupply?.toLocaleString() || "Unlimited"} />
            <ReviewItem label="Transfer Fee" value={draft.transferFee ? `${draft.transferFee}%` : "None"} />
          </div>
        )}
        {draft.standard === "IOU" && (
          <div className="grid grid-cols-2 gap-3">
            <ReviewItem label="Currency Code" value={draft.currencyCode || "-"} />
            <ReviewItem label="Trustline Auth" value={renderBool(draft.trustlineAuthRequired)} />
            <ReviewItem label="Freeze Enabled" value={renderBool(draft.freezeEnabled)} />
            <ReviewItem label="Rippling Allowed" value={renderBool(draft.ripplingAllowed)} />
          </div>
        )}
        {draft.standard === "NFT" && (
          <div className="grid grid-cols-2 gap-3">
            <ReviewItem label="Taxon" value={draft.taxon.toString()} />
            <ReviewItem label="Transfer Fee" value={draft.transferFee ? `${draft.transferFee}%` : "None"} />
            <ReviewItem label="Burnable" value={renderBool(draft.burnable)} />
            <ReviewItem label="Only XRP" value={renderBool(draft.onlyXRP)} />
            {draft.metadataUri && <ReviewItem label="Metadata URI" value={draft.metadataUri} mono />}
          </div>
        )}
      </CollapsibleSection>

      {/* MPT Flags Section */}
      {draft.standard === "MPT" && (
        <CollapsibleSection
          title="MPT Flags"
          icon={<Flag className="h-4 w-4" />}
          isExpanded={isExpanded("flags")}
          onToggle={() => toggleSection("flags")}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">Computed Value:</span>
              {mptFlagsValue && (
                <Badge variant="outline" className="font-mono text-xs">
                  {mptFlagsValue.decimal} ({mptFlagsValue.hex})
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MPT_FLAG_INFO.map((flag) => (
                <div key={flag.key} className="flex items-center gap-2">
                  <ReviewItem 
                    label={flag.name} 
                    value={renderBool(draft[flag.key] as boolean)} 
                  />
                  <code className="text-[9px] font-mono text-muted-foreground">{flag.hex}</code>
                </div>
              ))}
            </div>
            {draft.xls89Metadata && (
              <div className="mt-3 pt-3 border-t border-border">
                <ReviewItem label="XLS-89 Metadata" value={draft.xls89Metadata} mono />
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Compliance */}
      <CollapsibleSection
        title="Compliance Settings"
        icon={<Shield className="h-4 w-4" />}
        isExpanded={isExpanded("compliance")}
        onToggle={() => toggleSection("compliance")}
      >
        <div className="grid grid-cols-2 gap-3">
          <ReviewItem label="KYC Required" value={renderBool(draft.compliance.kycRequired)} />
          <ReviewItem label="Accreditation Required" value={renderBool(draft.compliance.accreditationRequired)} />
          <ReviewItem label="PermissionDEX Enforced" value={renderBool(draft.compliance.permissionDexEnforced)} />
          {draft.compliance.lockupPeriod && (
            <ReviewItem label="Lockup Period" value={draft.compliance.lockupPeriod} />
          )}
        </div>
        {draft.compliance.jurisdictions.length > 0 && (
          <div className="mt-3">
            <ReviewItem label="Jurisdictions" value={draft.compliance.jurisdictions.join(", ")} />
          </div>
        )}
        {draft.compliance.transferRestrictions && (
          <div className="mt-3">
            <ReviewItem label="Transfer Restrictions" value={draft.compliance.transferRestrictions} />
          </div>
        )}
      </CollapsibleSection>

      <Separator />

      {/* Transaction Preview */}
      <Card className="bg-muted/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">XRPL Transaction Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction Type</span>
            <span className="text-foreground font-medium">
              {draft.standard === "MPT" ? "MPTokenIssuanceCreate" : draft.standard === "IOU" ? "AccountSet + TrustLine" : "NFTokenMint"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Fee</span>
            <span className="text-foreground">~0.000012 XRP</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Required Signers</span>
            <span className="text-foreground">
              {draft.wallet?.multiSignEnabled ? `${draft.wallet.multiSignQuorum} of ${draft.wallet.multiSignSigners}` : "1"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <Checkbox
          id="confirm"
          checked={confirmed}
          onCheckedChange={(checked) => setConfirmed(checked === true)}
        />
        <Label htmlFor="confirm" className="text-sm leading-relaxed cursor-pointer">
          I confirm that this token configuration is correct and I understand that once issued,
          certain properties cannot be changed on the XRP Ledger.
        </Label>
      </div>
    </div>
  );
};

// Helper components
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}) => (
  <Card className="bg-card border-border">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left"
    >
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <span className="font-medium text-foreground">{title}</span>
      </div>
      {isExpanded ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
    {isExpanded && <CardContent className="pt-0 pb-4">{children}</CardContent>}
  </Card>
);

interface ReviewItemProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ label, value, mono }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={cn("text-sm text-foreground mt-0.5", mono && "font-mono text-xs break-all")}>
      {value}
    </p>
  </div>
);
