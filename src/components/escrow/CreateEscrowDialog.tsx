import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EscrowConditionType, escrowConditionLabel } from "@/types/escrow";
import { mockWallets } from "@/data/mockWallets";
import { toast } from "@/hooks/use-toast";
import { XRPLAssetSelector } from "@/components/shared/XRPLAssetSelector";
import { SelectedAssetDisplay } from "@/components/shared/SelectedAssetDisplay";
import { XRPLAsset, createXRPAsset, formatAssetWithIssuer } from "@/types/xrplAsset";

interface CreateEscrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateEscrowDialog: React.FC<CreateEscrowDialogProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState(1);
  const [asset, setAsset] = useState<XRPLAsset>(createXRPAsset());
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [senderWalletId, setSenderWalletId] = useState("");
  const [conditionType, setConditionType] = useState<EscrowConditionType>("TIME");
  const [finishAfter, setFinishAfter] = useState("");
  const [cancelAfter, setCancelAfter] = useState("");

  const approvedWallets = mockWallets.filter((w) => w.permissionDexStatus === "APPROVED");

  const handleCreate = () => {
    toast({
      title: "Escrow Created",
      description: "The escrow has been created successfully. Awaiting multi-sig approval if required.",
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setAsset(createXRPAsset());
    setAmount("");
    setDestinationAddress("");
    setSenderWalletId("");
    setConditionType("TIME");
    setFinishAfter("");
    setCancelAfter("");
  };

  const canProceedStep1 = asset && senderWalletId;
  const canProceedStep2 = amount && destinationAddress;
  const canProceedStep3 = conditionType && (finishAfter || cancelAfter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Escrow</DialogTitle>
          <DialogDescription>
            Step {step} of 4 — {step === 1 ? "Select Asset" : step === 2 ? "Amount & Destination" : step === 3 ? "Conditions" : "Review"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Asset</Label>
                <XRPLAssetSelector
                  value={asset}
                  onChange={setAsset}
                  placeholder="Select asset for escrow"
                />
                <p className="text-xs text-muted-foreground">
                  Select the asset to be held in escrow (XRP or any issued token)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Sender Wallet</Label>
                <Select value={senderWalletId} onValueChange={setSenderWalletId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issuing wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedWallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name} {wallet.multiSignEnabled && "(Multi-Sig)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Selected Asset Preview */}
              {asset && (
                <SelectedAssetDisplay
                  asset={asset}
                  label="Selected Asset"
                />
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Amount of {asset.currency} to escrow
                </p>
              </div>
              <div className="space-y-2">
                <Label>Destination Address</Label>
                <Input
                  placeholder="rXXXXX..."
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>Condition Type</Label>
                <Select value={conditionType} onValueChange={(v) => setConditionType(v as EscrowConditionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["TIME", "CRYPTO", "ORACLE", "TIME_AND_CRYPTO"] as EscrowConditionType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {escrowConditionLabel[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(conditionType === "TIME" || conditionType === "TIME_AND_CRYPTO") && (
                <div className="space-y-2">
                  <Label>Unlock Date (Finish After)</Label>
                  <Input
                    type="date"
                    value={finishAfter}
                    onChange={(e) => setFinishAfter(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Expiration Date (Cancel After)</Label>
                <Input
                  type="date"
                  value={cancelAfter}
                  onChange={(e) => setCancelAfter(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {/* Selected Asset Confirmation */}
              <SelectedAssetDisplay
                asset={asset}
                label="Escrowed Asset"
              />
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{amount} {asset.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-mono text-xs">{destinationAddress.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="font-medium">{escrowConditionLabel[conditionType]}</span>
                </div>
                {finishAfter && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unlock Date</span>
                    <span className="font-medium">{finishAfter}</span>
                  </div>
                )}
                {cancelAfter && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiration</span>
                    <span className="font-medium">{cancelAfter}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3)
              }
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleCreate}>Create Escrow</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
