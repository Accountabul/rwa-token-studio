import React from "react";
import { Token, MPTProperties, IOUProperties, NFTProperties, tokenStatusLabel } from "@/types/token";
import { Role } from "@/types/tokenization";
import { mockTokenAuditLog } from "@/data/mockTokens";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TokenStatusBadge, TokenStandardBadge } from "./TokenStatusBadge";
import { AuditLog } from "./AuditLog";
import { 
  ArrowLeft, 
  ExternalLink, 
  Snowflake, 
  Flame, 
  Plus,
  Copy,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TokenDetailsProps {
  token: Token;
  role: Role;
  onBack: () => void;
}

export const TokenDetails: React.FC<TokenDetailsProps> = ({ token, role, onBack }) => {
  const auditEntries = mockTokenAuditLog.filter((e) => e.tokenId === token.id);

  const copyAddress = () => {
    navigator.clipboard.writeText(token.issuerWalletAddress);
    toast({ title: "Address copied", description: "Wallet address copied to clipboard" });
  };

  const canMintBurn = role === "SUPER_ADMIN" || role === "TOKENIZATION_MANAGER";
  const canFreeze = role === "SUPER_ADMIN" || role === "COMPLIANCE_OFFICER";

  const renderProperties = () => {
    if (token.standard === "MPT") {
      const props = token.properties as MPTProperties;
      return (
        <div className="grid grid-cols-2 gap-4">
          <PropertyItem label="Max Supply" value={props.maxSupply?.toLocaleString() || "Unlimited"} />
          <PropertyItem label="Transfer Fee" value={props.transferFee ? `${props.transferFee}%` : "None"} />
          <PropertyItem label="Clawback" value={props.clawbackEnabled} />
          <PropertyItem label="Escrow" value={props.escrowEnabled} />
        </div>
      );
    }
    
    if (token.standard === "IOU") {
      const props = token.properties as IOUProperties;
      return (
        <div className="grid grid-cols-2 gap-4">
          <PropertyItem label="Currency Code" value={props.currencyCode} />
          <PropertyItem label="Trustline Auth Required" value={props.trustlineAuthRequired} />
          <PropertyItem label="Freeze Enabled" value={props.freezeEnabled} />
          <PropertyItem label="Rippling Allowed" value={props.ripplingAllowed} />
        </div>
      );
    }
    
    if (token.standard === "NFT") {
      const props = token.properties as NFTProperties;
      return (
        <div className="grid grid-cols-2 gap-4">
          <PropertyItem label="Taxon" value={props.taxon.toString()} />
          <PropertyItem label="Transfer Fee" value={props.transferFee ? `${props.transferFee}%` : "None"} />
          <PropertyItem label="Burnable" value={props.burnable} />
          <PropertyItem label="Only XRP" value={props.onlyXRP} />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">{token.name}</h1>
              <TokenStandardBadge standard={token.standard} />
              <TokenStatusBadge status={token.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{token.symbol}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {token.status === "ISSUED" && canFreeze && (
            <Button variant="outline" className="gap-2">
              <Snowflake className="h-4 w-4" />
              Freeze
            </Button>
          )}
          {token.status === "ISSUED" && canMintBurn && token.standard !== "NFT" && (
            <>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Mint
              </Button>
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                <Flame className="h-4 w-4" />
                Burn
              </Button>
            </>
          )}
          {token.xrplTxHash && (
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Explorer
            </Button>
          )}
        </div>
      </div>

      {/* Supply Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Issued</p>
            <p className="text-xl font-semibold text-foreground">{token.totalIssued.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Circulating</p>
            <p className="text-xl font-semibold text-foreground">{token.circulatingSupply.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">In Escrow</p>
            <p className="text-xl font-semibold text-foreground">{token.inEscrow.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Held by Issuer</p>
            <p className="text-xl font-semibold text-foreground">{token.heldByIssuer.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Token Properties */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Token Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <PropertyItem label="Description" value={token.description} fullWidth />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Issuer Wallet:</span>
                <code className="text-xs bg-muted/50 px-2 py-1 rounded">{token.issuerWalletAddress}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              
              {token.decimals !== undefined && (
                <PropertyItem label="Decimals" value={token.decimals.toString()} />
              )}
              
              {renderProperties()}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <PropertyItem label="Created" value={new Date(token.createdAt).toLocaleDateString()} />
                {token.issuedAt && (
                  <PropertyItem label="Issued" value={new Date(token.issuedAt).toLocaleDateString()} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Compliance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <PropertyItem label="KYC Required" value={token.compliance.kycRequired} />
                <PropertyItem label="Accreditation Required" value={token.compliance.accreditationRequired} />
                <PropertyItem label="PermissionDEX Enforced" value={token.compliance.permissionDexEnforced} />
                {token.compliance.lockupPeriod && (
                  <PropertyItem label="Lockup Period" value={token.compliance.lockupPeriod} />
                )}
                {token.compliance.jurisdictions.length > 0 && (
                  <PropertyItem label="Jurisdictions" value={token.compliance.jurisdictions.join(", ")} fullWidth />
                )}
                {token.compliance.transferRestrictions && (
                  <PropertyItem label="Transfer Restrictions" value={token.compliance.transferRestrictions} fullWidth />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <AuditLog entries={auditEntries} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for property display
interface PropertyItemProps {
  label: string;
  value: string | boolean;
  fullWidth?: boolean;
}

const PropertyItem: React.FC<PropertyItemProps> = ({ label, value, fullWidth }) => {
  const renderValue = () => {
    if (typeof value === "boolean") {
      return value ? (
        <span className="flex items-center gap-1 text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5" /> Yes
        </span>
      ) : (
        <span className="flex items-center gap-1 text-muted-foreground">
          <XCircle className="h-3.5 w-3.5" /> No
        </span>
      );
    }
    return <span className="text-foreground">{value}</span>;
  };

  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <div className="text-sm">{renderValue()}</div>
    </div>
  );
};
