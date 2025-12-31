import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { XRPLAsset, createXRPAsset, formatAssetWithIssuer, shortenAddress } from "@/types/xrplAsset";

export function CreatePoolDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [asset1, setAsset1] = useState<XRPLAsset>(createXRPAsset());
  const [asset1Amount, setAsset1Amount] = useState("");
  const [asset2, setAsset2] = useState<XRPLAsset | null>(null);
  const [asset2Amount, setAsset2Amount] = useState("");
  const [tradingFee, setTradingFee] = useState("0.3");

  const handleCreate = () => {
    if (!asset1Amount || !asset2Amount || !asset2) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "AMM Pool Created",
      description: `Created ${asset1.currency}/${asset2.currency} pool with ${tradingFee}% fee`,
    });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAsset1(createXRPAsset());
    setAsset1Amount("");
    setAsset2(null);
    setAsset2Amount("");
    setTradingFee("0.3");
  };

  const canCreate = asset1Amount && asset2Amount && asset2;
  const initialPrice = canCreate 
    ? (parseFloat(asset2Amount) / parseFloat(asset1Amount)).toFixed(4) 
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Pool
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create AMM Pool</DialogTitle>
          <DialogDescription>
            Create a new automated market maker pool with initial liquidity.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Asset 1 */}
          <div className="p-4 rounded-lg border space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Asset 1</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Asset</Label>
                <XRPLAssetSelector
                  value={asset1}
                  onChange={setAsset1}
                  placeholder="Select first asset"
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={asset1Amount}
                  onChange={(e) => setAsset1Amount(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Asset 2 */}
          <div className="p-4 rounded-lg border space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Asset 2</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Asset</Label>
                <XRPLAssetSelector
                  value={asset2}
                  onChange={setAsset2}
                  placeholder="Select second asset"
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={asset2Amount}
                  onChange={(e) => setAsset2Amount(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Trading Fee */}
          <div className="space-y-2">
            <Label>Trading Fee</Label>
            <Select value={tradingFee} onValueChange={setTradingFee}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.1">0.1%</SelectItem>
                <SelectItem value="0.3">0.3% (Recommended)</SelectItem>
                <SelectItem value="0.5">0.5%</SelectItem>
                <SelectItem value="1.0">1.0%</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Fee charged on each trade, distributed to liquidity providers
            </p>
          </div>

          {/* Summary */}
          {canCreate && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Pool Summary</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  {asset1Amount} {formatAssetWithIssuer(asset1)} + {asset2Amount} {formatAssetWithIssuer(asset2)}
                </p>
                <p>
                  Initial price: 1 {asset1.currency} = {initialPrice} {asset2?.currency}
                </p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate}>Create Pool</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
