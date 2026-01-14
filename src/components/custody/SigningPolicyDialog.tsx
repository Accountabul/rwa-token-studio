import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SigningPolicy } from "@/types/custody";
import { WalletRole, XRPLNetwork } from "@/types/token";
import { batchableTxTypeLabels, getOrderedCategories, getTxTypesForCategory, categoryLabels } from "@/types/batchTransaction";

interface SigningPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: SigningPolicy | null;
  onSave: (policy: Omit<SigningPolicy, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

const WALLET_ROLES: WalletRole[] = [
  "ISSUER",
  "TREASURY",
  "OPS",
  "CUSTODY",
  "ESCROW",
  "SETTLEMENT",
];

const NETWORKS: XRPLNetwork[] = ["testnet", "devnet", "mainnet"];

export const SigningPolicyDialog: React.FC<SigningPolicyDialogProps> = ({
  open,
  onOpenChange,
  policy,
  onSave,
}) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    policyName: "",
    description: "",
    walletRoles: [] as WalletRole[],
    network: "testnet" as XRPLNetwork,
    allowedTxTypes: [] as string[],
    maxAmountXrp: "",
    maxDailyTxs: "",
    requiresMultiSign: false,
    minSigners: "1",
    rateLimitPerMinute: "60",
    isActive: true,
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        policyName: policy.policyName,
        description: policy.description || "",
        walletRoles: policy.walletRoles,
        network: policy.network,
        allowedTxTypes: policy.allowedTxTypes,
        maxAmountXrp: policy.maxAmountXrp?.toString() || "",
        maxDailyTxs: policy.maxDailyTxs?.toString() || "",
        requiresMultiSign: policy.requiresMultiSign,
        minSigners: policy.minSigners.toString(),
        rateLimitPerMinute: policy.rateLimitPerMinute.toString(),
        isActive: policy.isActive,
      });
    } else {
      setFormData({
        policyName: "",
        description: "",
        walletRoles: [],
        network: "testnet",
        allowedTxTypes: [],
        maxAmountXrp: "",
        maxDailyTxs: "",
        requiresMultiSign: false,
        minSigners: "1",
        rateLimitPerMinute: "60",
        isActive: true,
      });
    }
  }, [policy, open]);

  const handleWalletRoleToggle = (role: WalletRole) => {
    setFormData((prev) => ({
      ...prev,
      walletRoles: prev.walletRoles.includes(role)
        ? prev.walletRoles.filter((r) => r !== role)
        : [...prev.walletRoles, role],
    }));
  };

  const handleTxTypeToggle = (txType: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedTxTypes: prev.allowedTxTypes.includes(txType)
        ? prev.allowedTxTypes.filter((t) => t !== txType)
        : [...prev.allowedTxTypes, txType],
    }));
  };

  const handleSelectAllTxTypes = (category: string) => {
    const typesInCategory = getTxTypesForCategory(category as any);
    const allSelected = typesInCategory.every((t) =>
      formData.allowedTxTypes.includes(t)
    );

    setFormData((prev) => ({
      ...prev,
      allowedTxTypes: allSelected
        ? prev.allowedTxTypes.filter((t) => !typesInCategory.includes(t as any))
        : [...new Set([...prev.allowedTxTypes, ...typesInCategory])],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave({
        policyName: formData.policyName,
        description: formData.description || undefined,
        walletRoles: formData.walletRoles,
        network: formData.network,
        allowedTxTypes: formData.allowedTxTypes,
        maxAmountXrp: formData.maxAmountXrp ? Number(formData.maxAmountXrp) : undefined,
        maxDailyTxs: formData.maxDailyTxs ? Number(formData.maxDailyTxs) : undefined,
        requiresMultiSign: formData.requiresMultiSign,
        minSigners: Number(formData.minSigners) || 1,
        rateLimitPerMinute: Number(formData.rateLimitPerMinute) || 60,
        isActive: formData.isActive,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save policy:", error);
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!policy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Signing Policy" : "Create Signing Policy"}</DialogTitle>
          <DialogDescription>
            Configure rules for transaction signing based on wallet role and transaction type.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 pb-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="policyName">Policy Name *</Label>
                    <Input
                      id="policyName"
                      value={formData.policyName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, policyName: e.target.value }))
                      }
                      placeholder="e.g., Standard Treasury Policy"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="network">Network *</Label>
                    <Select
                      value={formData.network}
                      onValueChange={(value: XRPLNetwork) =>
                        setFormData((prev) => ({ ...prev, network: value }))
                      }
                    >
                      <SelectTrigger id="network">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NETWORKS.map((net) => (
                          <SelectItem key={net} value={net} className="capitalize">
                            {net}
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
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe when this policy applies..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Wallet Roles */}
              <div className="space-y-2">
                <Label>Applicable Wallet Roles *</Label>
                <div className="flex flex-wrap gap-2">
                  {WALLET_ROLES.map((role) => (
                    <Badge
                      key={role}
                      variant={formData.walletRoles.includes(role) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleWalletRoleToggle(role)}
                    >
                      {role.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Transaction Types */}
              <div className="space-y-2">
                <Label>Allowed Transaction Types *</Label>
                <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                  {getOrderedCategories().map((category) => {
                    const types = getTxTypesForCategory(category);
                    const selectedCount = types.filter((t) =>
                      formData.allowedTxTypes.includes(t)
                    ).length;

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {categoryLabels[category]}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectAllTxTypes(category)}
                            className="h-6 text-xs"
                          >
                            {selectedCount === types.length ? "Deselect All" : "Select All"}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {types.map((txType) => (
                            <Badge
                              key={txType}
                              variant={
                                formData.allowedTxTypes.includes(txType)
                                  ? "secondary"
                                  : "outline"
                              }
                              className="cursor-pointer text-xs"
                              onClick={() => handleTxTypeToggle(txType)}
                            >
                              {batchableTxTypeLabels[txType]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-4">
                <Label className="text-base">Limits & Controls</Label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Max Amount (XRP)</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.maxAmountXrp}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, maxAmountXrp: e.target.value }))
                      }
                      placeholder="No limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDaily">Max Daily Txns</Label>
                    <Input
                      id="maxDaily"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.maxDailyTxs}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, maxDailyTxs: e.target.value }))
                      }
                      placeholder="No limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rateLimit">Rate Limit/min</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      min="1"
                      value={formData.rateLimitPerMinute}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, rateLimitPerMinute: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Sign */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="multiSign">Require Multi-Sign</Label>
                    <p className="text-xs text-muted-foreground">
                      Transactions must be approved by multiple signers
                    </p>
                  </div>
                  <Switch
                    id="multiSign"
                    checked={formData.requiresMultiSign}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, requiresMultiSign: checked }))
                    }
                  />
                </div>

                {formData.requiresMultiSign && (
                  <div className="space-y-2">
                    <Label htmlFor="minSigners">Minimum Signers Required</Label>
                    <Input
                      id="minSigners"
                      type="number"
                      min="2"
                      value={formData.minSigners}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, minSigners: e.target.value }))
                      }
                    />
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive policies are not enforced
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                saving ||
                !formData.policyName ||
                formData.walletRoles.length === 0 ||
                formData.allowedTxTypes.length === 0
              }
            >
              {saving ? "Saving..." : isEdit ? "Update Policy" : "Create Policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
