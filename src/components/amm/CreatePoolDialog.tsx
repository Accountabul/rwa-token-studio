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

export function CreatePoolDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [asset1Currency, setAsset1Currency] = useState("XRP");
  const [asset1Amount, setAsset1Amount] = useState("");
  const [asset2Currency, setAsset2Currency] = useState("");
  const [asset2Issuer, setAsset2Issuer] = useState("");
  const [asset2Amount, setAsset2Amount] = useState("");
  const [tradingFee, setTradingFee] = useState("0.3");

  const handleCreate = () => {
    if (!asset1Amount || !asset2Amount || !asset2Currency) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "AMM Pool Created",
      description: `Created ${asset1Currency}/${asset2Currency} pool with ${tradingFee}% fee`,
    });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAsset1Currency("XRP");
    setAsset1Amount("");
    setAsset2Currency("");
    setAsset2Issuer("");
    setAsset2Amount("");
    setTradingFee("0.3");
  };

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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={asset1Currency} onValueChange={setAsset1Currency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XRP">XRP</SelectItem>
                    <SelectItem value="USD">USD (IOU)</SelectItem>
                    <SelectItem value="EUR">EUR (IOU)</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Currency Code</Label>
                  <Input
                    placeholder="e.g., USD, TST"
                    value={asset2Currency}
                    onChange={(e) => setAsset2Currency(e.target.value.toUpperCase())}
                    maxLength={3}
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
              {asset2Currency && asset2Currency !== "XRP" && (
                <div className="space-y-2">
                  <Label>Issuer Address</Label>
                  <Input
                    placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    value={asset2Issuer}
                    onChange={(e) => setAsset2Issuer(e.target.value)}
                  />
                </div>
              )}
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
          {asset1Amount && asset2Amount && asset2Currency && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm font-medium">Pool Summary</p>
              <p className="text-sm text-muted-foreground">
                {asset1Amount} {asset1Currency} + {asset2Amount} {asset2Currency}
              </p>
              <p className="text-sm text-muted-foreground">
                Initial price: 1 {asset1Currency} = {(parseFloat(asset2Amount) / parseFloat(asset1Amount)).toFixed(4)} {asset2Currency}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Pool</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}