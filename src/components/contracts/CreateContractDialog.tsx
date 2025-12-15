import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ContractTemplate, contractTemplateLabels, contractTemplateDescriptions } from "@/types/smartContract";
import { Upload, FileCode, Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const templates: ContractTemplate[] = [
  "ESCROW_AUTOMATION",
  "TOKEN_VESTING",
  "ORACLE_PRICE_FEED",
  "STAKING_REWARDS",
  "CUSTOM"
];

const CreateContractDialog = ({ open, onOpenChange }: CreateContractDialogProps) => {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState<ContractTemplate>("ESCROW_AUTOMATION");
  const [wasmFile, setWasmFile] = useState<File | null>(null);
  const [wasmHash, setWasmHash] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [network, setNetwork] = useState<"testnet" | "devnet">("testnet");
  const [deploying, setDeploying] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 64 * 1024) {
        toast({
          title: "File too large",
          description: "WASM files must be under 64KB for XRPL deployment",
          variant: "destructive"
        });
        return;
      }
      setWasmFile(file);
      // Simulate hash generation
      setWasmHash("A1B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456");
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDeploying(false);
    toast({
      title: "Contract deployed",
      description: "Your smart contract has been deployed to the network"
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setTemplate("ESCROW_AUTOMATION");
    setWasmFile(null);
    setWasmHash("");
    setName("");
    setDescription("");
    setNetwork("testnet");
  };

  const canProceed = () => {
    switch (step) {
      case 1: return template;
      case 2: return template === "CUSTOM" ? wasmFile !== null : true;
      case 3: return name.trim().length > 0;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Deploy Smart Contract</DialogTitle>
        </DialogHeader>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s < step ? "bg-primary text-primary-foreground" :
                  s === step ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 4 && <div className={`w-16 h-0.5 ${s < step ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Template</span>
            <span>WASM</span>
            <span>Config</span>
            <span>Review</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a contract template or upload custom WASM</p>
            <RadioGroup value={template} onValueChange={(v) => setTemplate(v as ContractTemplate)}>
              <div className="grid grid-cols-1 gap-3">
                {templates.map((t) => (
                  <Label key={t} htmlFor={t} className="cursor-pointer">
                    <Card className={`transition-colors ${template === t ? "border-primary" : ""}`}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <RadioGroupItem value={t} id={t} />
                        <div className="flex-1">
                          <div className="font-medium">{contractTemplateLabels[t]}</div>
                          <div className="text-sm text-muted-foreground">
                            {contractTemplateDescriptions[t]}
                          </div>
                        </div>
                        {t === "CUSTOM" && <FileCode className="h-5 w-5 text-muted-foreground" />}
                      </CardContent>
                    </Card>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {template === "CUSTOM" ? (
              <>
                <p className="text-sm text-muted-foreground">Upload your compiled WASM contract (max 64KB)</p>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".wasm"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="wasm-upload"
                  />
                  <label htmlFor="wasm-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    {wasmFile ? (
                      <div>
                        <p className="font-medium">{wasmFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(wasmFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Drop WASM file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </div>
                    )}
                  </label>
                </div>
                {wasmHash && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">SHA-256 Hash</p>
                    <p className="font-mono text-xs break-all">{wasmHash}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Using Pre-built Template</h3>
                <p className="text-sm text-muted-foreground">
                  The {contractTemplateLabels[template]} template will be used.
                  <br />No WASM upload required.
                </p>
                <Badge className="mt-4">{contractTemplateLabels[template]}</Badge>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Contract Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Property Escrow v1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the contract's purpose"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Network</Label>
              <RadioGroup value={network} onValueChange={(v) => setNetwork(v as typeof network)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="devnet" id="devnet" />
                  <Label htmlFor="devnet">Devnet</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="testnet" id="testnet" />
                  <Label htmlFor="testnet">Testnet</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-medium">Review & Deploy</h3>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template</span>
                  <Badge>{contractTemplateLabels[template]}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{name}</span>
                </div>
                {description && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description</span>
                    <span className="text-sm max-w-[200px] text-right">{description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <Badge variant="secondary">{network}</Badge>
                </div>
                {wasmFile && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WASM Size</span>
                    <span>{(wasmFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-600">
                Deploying a contract will consume network fees and create an on-chain record.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleDeploy} disabled={deploying}>
              {deploying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Deploy Contract
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContractDialog;
