import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { XRPLAssetSelector } from "@/components/shared/XRPLAssetSelector";
import { SelectedAssetDisplay } from "@/components/shared/SelectedAssetDisplay";
import { XRPLAsset, createXRPAsset, formatAssetWithIssuer } from "@/types/xrplAsset";

export function CreateCheckDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<XRPLAsset>(createXRPAsset());
  const [expiration, setExpiration] = useState("");

  const handleCreate = () => {
    if (!destination || !amount) {
      toast({
        title: "Missing Fields",
        description: "Please fill in destination and amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Check Created",
      description: `Created check for ${amount} ${formatAssetWithIssuer(asset)} to ${destination.slice(0, 12)}...`,
    });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDestination("");
    setAmount("");
    setAsset(createXRPAsset());
    setExpiration("");
  };

  const canCreate = destination && amount && asset;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Check
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Check</DialogTitle>
          <DialogDescription>
            Create a new check that can be cashed by the destination account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination Address</Label>
            <Input
              id="destination"
              placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Asset</Label>
              <XRPLAssetSelector
                value={asset}
                onChange={setAsset}
                placeholder="Select asset"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiration">Expiration (Optional)</Label>
            <Input
              id="expiration"
              type="datetime-local"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no expiration
            </p>
          </div>

          {/* Selected Asset Confirmation */}
          {canCreate && asset && (
            <SelectedAssetDisplay
              asset={asset}
              label="Selected Asset"
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate}>Create Check</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
