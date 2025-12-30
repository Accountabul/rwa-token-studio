import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Wallet, Loader2, Server, Shield } from "lucide-react";
import { WalletRole } from "@/types/token";
import { walletService } from "@/domain/services/WalletService";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ProvisionWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  role: WalletRole;
  enableMultiSig: boolean;
  autoFund: boolean;
}

const walletRoles: { value: WalletRole; label: string; description: string }[] = [
  { value: "ISSUER", label: "Issuer", description: "Issues tokens and manages supply" },
  { value: "TREASURY", label: "Treasury", description: "Holds reserves and manages liquidity" },
  { value: "ESCROW", label: "Escrow", description: "Holds funds in escrow arrangements" },
  { value: "OPS", label: "Operations", description: "Day-to-day operational transactions" },
  { value: "TEST", label: "Test", description: "Testing and development purposes" },
];

export const ProvisionWalletDialog: React.FC<ProvisionWalletDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isProvisioning, setIsProvisioning] = useState(false);
  
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
      role: "OPS",
      enableMultiSig: false,
      autoFund: true,
    },
  });

  const enableMultiSig = watch("enableMultiSig");
  const autoFund = watch("autoFund");
  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setIsProvisioning(true);
    
    try {
      const wallet = await walletService.provisionWallet({
        name: data.name,
        role: data.role,
        network: "testnet",
        enableMultiSig: data.enableMultiSig,
        autoFund: data.autoFund,
        createdBy: "current-user-id", // Would come from auth context
        createdByName: "Current User", // Would come from auth context
      });

      toast.success("Wallet provisioned successfully", {
        description: `${wallet.name} is now ${data.autoFund ? "funded and " : ""}ready to use.`,
      });

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
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
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Provision XRPL Wallet
          </DialogTitle>
          <DialogDescription>
            Create a new managed wallet on XRPL Testnet. This wallet will be registered 
            as an internal system resource with full audit logging.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Wallet Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Wallet Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Accountabul Ops Wallet 04"
              {...register("name", {
                required: "Wallet name is required",
                minLength: { value: 3, message: "Name must be at least 3 characters" },
              })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Wallet Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Wallet Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue("role", value as WalletRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {walletRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        — {role.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Network */}
          <div className="space-y-2">
            <Label>Network</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Server className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Testnet</span>
              <span className="text-xs text-muted-foreground">(Locked)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mainnet provisioning will be available after vault integration.
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="enableMultiSig"
                checked={enableMultiSig}
                onCheckedChange={(checked) => setValue("enableMultiSig", !!checked)}
              />
              <div className="space-y-0.5">
                <Label htmlFor="enableMultiSig" className="cursor-pointer flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Enable Multi-Sig
                </Label>
                <p className="text-xs text-muted-foreground">
                  Configure signer list after creation
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="autoFund"
                checked={autoFund}
                onCheckedChange={(checked) => setValue("autoFund", !!checked)}
              />
              <div className="space-y-0.5">
                <Label htmlFor="autoFund" className="cursor-pointer">
                  Auto-fund via Faucet
                </Label>
                <p className="text-xs text-muted-foreground">
                  Request 1,000 XRP from Testnet faucet
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProvisioning}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProvisioning}>
              {isProvisioning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Provisioning...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Provision Wallet
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
