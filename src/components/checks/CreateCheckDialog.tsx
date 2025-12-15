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

export function CreateCheckDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("XRP");
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
      description: `Created check for ${amount} ${currency} to ${destination.slice(0, 12)}...`,
    });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDestination("");
    setAmount("");
    setCurrency("XRP");
    setExpiration("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Check
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Check</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}