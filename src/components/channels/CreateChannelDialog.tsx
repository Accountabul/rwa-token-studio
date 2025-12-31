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

export function CreateChannelDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [settleDelay, setSettleDelay] = useState("24");
  const [publicKey, setPublicKey] = useState("");

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
      title: "Payment Channel Created",
      description: `Created channel with ${amount} XRP capacity to ${destination.slice(0, 12)}...`,
    });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDestination("");
    setAmount("");
    setSettleDelay("24");
    setPublicKey("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Payment Channel</DialogTitle>
          <DialogDescription>
            Open a new payment channel for high-throughput off-ledger payments.
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
          <div className="space-y-2">
            <Label htmlFor="amount">Channel Capacity (XRP)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Payment channels on XRPL only support XRP (native asset)
            </p>
          </div>
          <div className="space-y-2">
            <Label>Settle Delay</Label>
            <Select value={settleDelay} onValueChange={setSettleDelay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="72">3 days</SelectItem>
                <SelectItem value="168">7 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Time the destination has to submit final claim before closure
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="publicKey">Destination Public Key (Optional)</Label>
            <Input
              id="publicKey"
              placeholder="ED..."
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Required for off-ledger claim verification
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Channel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
