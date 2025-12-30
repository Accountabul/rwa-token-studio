import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Loader2, Save } from "lucide-react";
import { 
  IssuingWallet, 
  WalletRole, 
  PurposeCode, 
  RiskTier, 
  ReviewFrequency,
  DIDMethod,
  VerifiableCredentialType,
  WalletCapabilities,
  walletRoleLabel,
  walletRoleDescription,
  purposeCodeLabel,
  riskTierLabel,
  reviewFrequencyLabel,
  didMethodLabel,
  vcTypeLabel,
  roleDefaultCapabilities,
} from "@/types/token";
import { updateWallet } from "@/lib/walletApi";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { WalletTagsInput } from "./WalletTagsInput";
import { WalletCapabilitiesGrid, defaultCapabilities } from "./WalletCapabilitiesGrid";

interface EditWalletDialogProps {
  wallet: IssuingWallet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  role: WalletRole;
  purposeCode: PurposeCode;
  riskTier: RiskTier;
  reviewFrequency: ReviewFrequency;
  businessUnit: string;
  jurisdiction: string;
  assetClass: string;
  contactEmail: string;
  contactPhone: string;
  externalRefId: string;
  didMethod: DIDMethod;
  vcIssuerCapable: boolean;
}

const walletRoles = Object.entries(walletRoleLabel).map(([value, label]) => ({
  value: value as WalletRole,
  label,
  description: walletRoleDescription[value as WalletRole],
}));

const purposeCodes = Object.entries(purposeCodeLabel).map(([value, label]) => ({
  value: value as PurposeCode,
  label,
}));

const riskTiers = Object.entries(riskTierLabel).map(([value, label]) => ({
  value: value as RiskTier,
  label,
}));

const reviewFrequencies = Object.entries(reviewFrequencyLabel).map(([value, label]) => ({
  value: value as ReviewFrequency,
  label,
}));

const didMethods = Object.entries(didMethodLabel).map(([value, label]) => ({
  value: value as DIDMethod,
  label,
}));

const vcTypes = Object.entries(vcTypeLabel).map(([value, label]) => ({
  value: value as VerifiableCredentialType,
  label,
}));

const jurisdictions = [
  "US", "UK", "EU", "CH", "SG", "HK", "JP", "AU", "CA", "AE", "OTHER"
];

export const EditWalletDialog: React.FC<EditWalletDialogProps> = ({
  wallet,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState<string[]>(wallet.tags || []);
  const [capabilities, setCapabilities] = useState<WalletCapabilities>({
    canIssueTokens: wallet.canIssueTokens || false,
    canMintNfts: wallet.canMintNfts || false,
    canClawback: wallet.canClawback || false,
    canFreeze: wallet.canFreeze || false,
    canCreateEscrows: wallet.canCreateEscrows || false,
    canManageAmm: wallet.canManageAmm || false,
    canCreateChannels: wallet.canCreateChannels || false,
    canAuthorizeHolders: wallet.canAuthorizeHolders || false,
    requiresDestinationTag: wallet.requiresDestinationTag || false,
  });
  const [selectedVCs, setSelectedVCs] = useState<VerifiableCredentialType[]>(
    wallet.verifiableCredentials || []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: wallet.name,
      description: wallet.description || "",
      role: wallet.role,
      purposeCode: wallet.purposeCode || "GENERAL",
      riskTier: wallet.riskTier || "MEDIUM",
      reviewFrequency: wallet.reviewFrequency || "QUARTERLY",
      businessUnit: wallet.businessUnit || "",
      jurisdiction: wallet.jurisdiction || "",
      assetClass: wallet.assetClass || "",
      contactEmail: wallet.contactEmail || "",
      contactPhone: wallet.contactPhone || "",
      externalRefId: wallet.externalRefId || "",
      didMethod: wallet.didMethod || "none",
      vcIssuerCapable: wallet.vcIssuerCapable || false,
    },
  });

  // Reset form when wallet changes
  useEffect(() => {
    reset({
      name: wallet.name,
      description: wallet.description || "",
      role: wallet.role,
      purposeCode: wallet.purposeCode || "GENERAL",
      riskTier: wallet.riskTier || "MEDIUM",
      reviewFrequency: wallet.reviewFrequency || "QUARTERLY",
      businessUnit: wallet.businessUnit || "",
      jurisdiction: wallet.jurisdiction || "",
      assetClass: wallet.assetClass || "",
      contactEmail: wallet.contactEmail || "",
      contactPhone: wallet.contactPhone || "",
      externalRefId: wallet.externalRefId || "",
      didMethod: wallet.didMethod || "none",
      vcIssuerCapable: wallet.vcIssuerCapable || false,
    });
    setTags(wallet.tags || []);
    setCapabilities({
      canIssueTokens: wallet.canIssueTokens || false,
      canMintNfts: wallet.canMintNfts || false,
      canClawback: wallet.canClawback || false,
      canFreeze: wallet.canFreeze || false,
      canCreateEscrows: wallet.canCreateEscrows || false,
      canManageAmm: wallet.canManageAmm || false,
      canCreateChannels: wallet.canCreateChannels || false,
      canAuthorizeHolders: wallet.canAuthorizeHolders || false,
      requiresDestinationTag: wallet.requiresDestinationTag || false,
    });
    setSelectedVCs(wallet.verifiableCredentials || []);
  }, [wallet, reset]);

  const selectedRole = watch("role");
  const selectedDIDMethod = watch("didMethod");
  const vcIssuerCapable = watch("vcIssuerCapable");

  const toggleVC = (vc: VerifiableCredentialType) => {
    setSelectedVCs((prev) =>
      prev.includes(vc) ? prev.filter((v) => v !== vc) : [...prev, vc]
    );
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);

    try {
      await updateWallet(wallet.id, {
        name: data.name,
        description: data.description || undefined,
        role: data.role,
        purposeCode: data.purposeCode,
        riskTier: data.riskTier,
        reviewFrequency: data.reviewFrequency,
        businessUnit: data.businessUnit || undefined,
        jurisdiction: data.jurisdiction || undefined,
        assetClass: data.assetClass || undefined,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
        externalRefId: data.externalRefId || undefined,
        didMethod: data.didMethod,
        vcIssuerCapable: data.vcIssuerCapable,
        verifiableCredentials: selectedVCs,
        tags,
        ...capabilities,
      });

      toast.success("Wallet updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("[EditWalletDialog] Error:", error);
      toast.error("Failed to update wallet", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Edit Wallet: {wallet.name}
          </DialogTitle>
          <DialogDescription>
            Modify wallet configuration, capabilities, and metadata.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Accordion type="multiple" defaultValue={["basic", "capabilities"]} className="w-full">
            {/* Basic Info */}
            <AccordionItem value="basic">
              <AccordionTrigger>Basic Information</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Wallet Name *</Label>
                    <Input
                      id="name"
                      {...register("name", {
                        required: "Name is required",
                        minLength: { value: 3, message: "Min 3 characters" },
                      })}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={selectedRole}
                      onValueChange={(v) => setValue("role", v as WalletRole)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {walletRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Purpose and notes for this wallet..."
                    rows={2}
                    {...register("description")}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Purpose Code</Label>
                    <Select
                      value={watch("purposeCode")}
                      onValueChange={(v) => setValue("purposeCode", v as PurposeCode)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {purposeCodes.map((pc) => (
                          <SelectItem key={pc.value} value={pc.value}>
                            {pc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Risk Tier</Label>
                    <Select
                      value={watch("riskTier")}
                      onValueChange={(v) => setValue("riskTier", v as RiskTier)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {riskTiers.map((rt) => (
                          <SelectItem key={rt.value} value={rt.value}>
                            {rt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Review Frequency</Label>
                    <Select
                      value={watch("reviewFrequency")}
                      onValueChange={(v) => setValue("reviewFrequency", v as ReviewFrequency)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reviewFrequencies.map((rf) => (
                          <SelectItem key={rf.value} value={rf.value}>
                            {rf.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Capabilities */}
            <AccordionItem value="capabilities">
              <AccordionTrigger>Capabilities</AccordionTrigger>
              <AccordionContent className="pt-2">
                <WalletCapabilitiesGrid
                  capabilities={capabilities}
                  onChange={setCapabilities}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Identity */}
            <AccordionItem value="identity">
              <AccordionTrigger>Identity & Credentials</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>DID Method</Label>
                    <Select
                      value={selectedDIDMethod}
                      onValueChange={(v) => setValue("didMethod", v as DIDMethod)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {didMethods.map((dm) => (
                          <SelectItem key={dm.value} value={dm.value}>
                            {dm.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <Checkbox
                      id="vcIssuerCapable"
                      checked={vcIssuerCapable}
                      onCheckedChange={(c) => setValue("vcIssuerCapable", !!c)}
                    />
                    <Label htmlFor="vcIssuerCapable" className="cursor-pointer">
                      VC Issuer Capable
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Verifiable Credentials</Label>
                  <div className="flex flex-wrap gap-2">
                    {vcTypes.map((vc) => (
                      <div
                        key={vc.value}
                        onClick={() => toggleVC(vc.value)}
                        className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all border ${
                          selectedVCs.includes(vc.value)
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-muted border-border hover:border-primary/20"
                        }`}
                      >
                        {vc.label}
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Classification */}
            <AccordionItem value="classification">
              <AccordionTrigger>Classification & Tags</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessUnit">Business Unit</Label>
                    <Input id="businessUnit" {...register("businessUnit")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Jurisdiction</Label>
                    <Select
                      value={watch("jurisdiction")}
                      onValueChange={(v) => setValue("jurisdiction", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {jurisdictions.map((j) => (
                          <SelectItem key={j} value={j}>
                            {j}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assetClass">Asset Class</Label>
                    <Input id="assetClass" {...register("assetClass")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <WalletTagsInput tags={tags} onChange={setTags} />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Contact & References */}
            <AccordionItem value="contact">
              <AccordionTrigger>Contact & References</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      {...register("contactEmail")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input id="contactPhone" {...register("contactPhone")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalRefId">External Reference ID</Label>
                  <Input
                    id="externalRefId"
                    placeholder="External system reference..."
                    {...register("externalRefId")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
