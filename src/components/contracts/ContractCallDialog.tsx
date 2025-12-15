import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ContractFunction } from "@/types/smartContract";
import { Loader2, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContractCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractName: string;
  func: ContractFunction | null;
}

const ContractCallDialog = ({ open, onOpenChange, contractName, func }: ContractCallDialogProps) => {
  const [params, setParams] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);

  if (!func) return null;

  const handleExecute = async () => {
    // Validate required params
    const missingRequired = func.parameters.filter(
      p => p.required && !params[p.name]?.trim()
    );
    
    if (missingRequired.length > 0) {
      toast({
        title: "Missing required parameters",
        description: `Please fill in: ${missingRequired.map(p => p.name).join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    setExecuting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setExecuting(false);
    
    toast({
      title: "Function executed",
      description: `${func.name}() completed successfully`
    });
    
    onOpenChange(false);
    setParams({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Call Contract Function</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Contract</p>
            <p className="font-medium">{contractName}</p>
          </div>

          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2">
              <code className="font-medium">{func.name}()</code>
              {func.returnType && (
                <Badge variant="outline">→ {func.returnType}</Badge>
              )}
            </div>
            {func.description && (
              <p className="text-sm text-muted-foreground mt-1">{func.description}</p>
            )}
          </div>

          {func.parameters.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Parameters</h4>
              {func.parameters.map((param) => (
                <div key={param.name} className="space-y-1">
                  <Label htmlFor={param.name}>
                    {param.name}
                    {param.required && <span className="text-destructive"> *</span>}
                    <Badge variant="outline" className="ml-2 text-xs">{param.type}</Badge>
                  </Label>
                  {param.description && (
                    <p className="text-xs text-muted-foreground">{param.description}</p>
                  )}
                  <Input
                    id={param.name}
                    value={params[param.name] || ""}
                    onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
                    placeholder={param.defaultValue || `Enter ${param.type}`}
                  />
                </div>
              ))}
            </div>
          )}

          {func.flags && func.flags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Transaction Flags</h4>
              <div className="flex flex-wrap gap-1">
                {func.flags.map((flag, i) => (
                  <Badge key={i} variant="secondary">{flag}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-sm text-yellow-600">
              This will submit a transaction to the network and consume fees.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExecute} disabled={executing}>
            {executing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Execute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractCallDialog;
