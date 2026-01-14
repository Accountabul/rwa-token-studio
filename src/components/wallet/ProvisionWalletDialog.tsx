import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Wallet, Loader2, Server, Shield, ChevronDown, ChevronUp, Lock, AlertTriangle } from "lucide-react";
import { 
  WalletRole, 
  XRPLNetwork, 
  PurposeCode, 
  RiskTier,
  WalletCapabilities,
  walletRoleLabel, 
  walletRoleDescription,
  purposeCodeLabel,
  riskTierLabel,
  roleDefaultCapabilities,
} from "@/types/token";
import { KeyStorageType, keyStorageTypeLabel } from "@/types/custody";
import { provisionWallet } from "@/lib/walletApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { WalletTagsInput } from "./WalletTagsInput";
import { WalletCapabilitiesGrid, defaultCapabilities } from "./WalletCapabilitiesGrid";

interface ProvisionWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  role: WalletRole;
  network: XRPLNetwork;
  purposeCode: PurposeCode;
  riskTier: RiskTier;
  keyStorageType: KeyStorageType;
  enableMultiSig: boolean;
  autoFund: boolean;
  businessUnit: string;
  jurisdiction: string;
}

const keyStorageTypes: { value: KeyStorageType; label: string; description: string; recommended: boolean }[] = [
  { value: "VAULT", label: "Vault-Backed", description: "Keys stored in secure vault (recommended)", recommended: true },
  { value: "HSM", label: "HSM", description: "Hardware Security Module (enterprise)", recommended: false },
  { value: "LEGACY_DB", label: "Legacy Database", description: "Encrypted in database (not recommended)", recommended: false },
  { value: "EXTERNAL", label: "External", description: "Managed externally (BYO key)", recommended: false },
];

const walletRoles = Object.entries(walletRoleLabel).map(([value, label]) => ({
  value: value as WalletRole,
  label,
  description: walletRoleDescription[value as WalletRole],
}));

const networks: { value: XRPLNetwork; label: string; enabled: boolean }[] = [
  { value: "testnet", label: "Testnet", enabled: true },
  { value: "devnet", label: "Devnet", enabled: true },
  { value: "mainnet", label: "Mainnet", enabled: false },
];

const purposeCodes = Object.entries(purposeCodeLabel).map(([value, label]) => ({
  value: value as PurposeCode,
  label,
}));

const riskTiers = Object.entries(riskTierLabel).map(([value, label]) => ({
  value: value as RiskTier,
  label,
}));

const jurisdictions = ["US", "UK", "EU", "CH", "SG", "HK", "JP", "AU", "CA", "AE", "OTHER"];

export const ProvisionWalletDialog: React.FC<ProvisionWalletDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<WalletCapabilities>(defaultCapabilities);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      role: "OPS",
      network: "testnet",
      purposeCode: "GENERAL",
      riskTier: "MEDIUM",
      keyStorageType: "VAULT", // Default to vault-backed for new wallets
      enableMultiSig: false,
      autoFund: true,
      businessUnit: "",
      jurisdiction: "",
    },
  });

  const enableMultiSig = watch("enableMultiSig");
  const autoFund = watch("autoFund");
  const selectedRole = watch("role");
  const selectedNetwork = watch("network");
  const selectedKeyStorage = watch("keyStorageType");

  // Apply role defaults when role changes
  const applyRoleDefaults = () => {
    const defaults = roleDefaultCapabilities[selectedRole] || {};
    setCapabilities({ ...defaultCapabilities, ...defaults });
  };

  const onSubmit = async (data: FormData) => {
    setIsProvisioning(true);
    
    try {
      const wallet = await provisionWallet({
        name: data.name,
        role: data.role,
        network: data.network,
        enableMultiSig: data.enableMultiSig,
        autoFund: data.autoFund,
        createdBy: "current-user-id",
        createdByName: "Current User",
        keyStorageType: data.keyStorageType,
        description: data.description || undefined,
        tags: tags.length > 0 ? tags : undefined,
        purposeCode: data.purposeCode,
        riskTier: data.riskTier,
        businessUnit: data.businessUnit || undefined,
        jurisdiction: data.jurisdiction || undefined,
        ...capabilities,
      });

      toast.success("Wallet provisioned successfully", {
        description: `${wallet.name} (${wallet.xrplAddress.slice(0, 8)}...) is now active.`,
      });

      reset();
      setTags([]);
      setCapabilities(defaultCapabilities);
      setAdvancedOpen(false);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('[ProvisionWalletDialog] Error:', error);
      toast.error("Failed to provision wallet", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleClose = () => {
    if (!isProvisioning) {
      reset();
      setTags([]);
      setCapabilities(defaultCapabilities);
      setAdvancedOpen(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Provision XRPL Wallet
          </DialogTitle>
          <DialogDescription>
            Create a new managed wallet with custom capabilities and metadata.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Wallet Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Treasury Wallet 01"
                {...register("name", {
                  required: "Wallet name is required",
                  minLength: { value: 3, message: "Name must be at least 3 characters" },
                })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={selectedRole} onValueChange={(v) => setValue("role", v as WalletRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {walletRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <span className="font-medium">{role.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={applyRoleDefaults}>
                Apply role defaults
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Network *</Label>
              <Select value={selectedNetwork} onValueChange={(v) => setValue("network", v as XRPLNetwork)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {networks.map((net) => (
                    <SelectItem key={net.value} value={net.value} disabled={!net.enabled}>
                      <div className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5" />
                        <span>{net.label}</span>
                        {!net.enabled && <span className="text-xs text-muted-foreground">(Coming soon)</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Purpose and notes..." rows={2} {...register("description")} />
          </div>

          {/* Key Storage Type Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Key Storage *
            </Label>
            <Select value={selectedKeyStorage} onValueChange={(v) => setValue("keyStorageType", v as KeyStorageType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {keyStorageTypes.map((kst) => (
                  <SelectItem key={kst.value} value={kst.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{kst.label}</span>
                      {kst.recommended && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Recommended</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {keyStorageTypes.find(k => k.value === selectedKeyStorage)?.description}
            </p>
          </div>

          {/* Legacy storage warning */}
          {selectedKeyStorage === "LEGACY_DB" && (
            <Alert variant="destructive" className="border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Warning:</strong> Legacy database storage keeps encrypted keys in the database. 
                This is not recommended for production wallets. Consider using Vault-Backed storage instead.
              </AlertDescription>
            </Alert>
          )}

          {/* Options */}
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <Checkbox id="enableMultiSig" checked={enableMultiSig} onCheckedChange={(c) => setValue("enableMultiSig", !!c)} />
              <Label htmlFor="enableMultiSig" className="cursor-pointer flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Enable Multi-Sig
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="autoFund" checked={autoFund} onCheckedChange={(c) => setValue("autoFund", !!c)} />
              <Label htmlFor="autoFund" className="cursor-pointer">Auto-fund (~1,000 XRP)</Label>
            </div>
          </div>

          {/* Advanced Options */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="w-full justify-between">
                Advanced Options
                {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Purpose Code</Label>
                  <Select value={watch("purposeCode")} onValueChange={(v) => setValue("purposeCode", v as PurposeCode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {purposeCodes.map((pc) => <SelectItem key={pc.value} value={pc.value}>{pc.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Risk Tier</Label>
                  <Select value={watch("riskTier")} onValueChange={(v) => setValue("riskTier", v as RiskTier)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {riskTiers.map((rt) => <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jurisdiction</Label>
                  <Select value={watch("jurisdiction")} onValueChange={(v) => setValue("jurisdiction", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {jurisdictions.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <WalletTagsInput tags={tags} onChange={setTags} />
              </div>

              <div className="space-y-2">
                <Label>Capabilities</Label>
                <WalletCapabilitiesGrid capabilities={capabilities} onChange={setCapabilities} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isProvisioning}>Cancel</Button>
            <Button type="submit" disabled={isProvisioning}>
              {isProvisioning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Provisioning...</> : <><Wallet className="w-4 h-4 mr-2" />Provision Wallet</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
