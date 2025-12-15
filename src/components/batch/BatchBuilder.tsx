import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import {
  BatchAtomicityMode,
  BatchableTxType,
  BatchTransaction,
  atomicityModeLabels,
  atomicityModeDescriptions,
  batchableTxTypeLabels,
  batchableTxTypeDescriptions,
  canSubmitBatch
} from "@/types/batchTransaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Plus, Trash2, GripVertical, ArrowUpDown, Send,
  Coins, Link, FileText, Lock, Unlock, Image, Shield, Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TransactionConfigForm from "./TransactionConfigForm";

interface BatchBuilderProps {
  role: Role;
}

const txTypeIcons: Partial<Record<BatchableTxType, React.ReactNode>> = {
  Payment: <Coins className="h-4 w-4" />,
  TrustSet: <Link className="h-4 w-4" />,
  EscrowCreate: <Lock className="h-4 w-4" />,
  EscrowFinish: <Unlock className="h-4 w-4" />,
  CheckCreate: <FileText className="h-4 w-4" />,
  NFTokenMint: <Image className="h-4 w-4" />,
  MPTokenAuthorize: <Shield className="h-4 w-4" />,
};

const availableTxTypes: BatchableTxType[] = [
  "Payment", "TrustSet", "OfferCreate", "OfferCancel",
  "EscrowCreate", "EscrowFinish", "EscrowCancel",
  "CheckCreate", "CheckCash", "CheckCancel",
  "NFTokenMint", "NFTokenBurn", "NFTokenCreateOffer",
  "MPTokenAuthorize", "MPTokenIssuanceCreate", "ContractCall"
];

const BatchBuilder = ({ role }: BatchBuilderProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [atomicityMode, setAtomicityMode] = useState<BatchAtomicityMode>("ALL_OR_NOTHING");
  const [transactions, setTransactions] = useState<BatchTransaction[]>([]);
  const [selectedTxIndex, setSelectedTxIndex] = useState<number | null>(null);

  const addTransaction = (txType: BatchableTxType) => {
    if (transactions.length >= 8) {
      toast({
        title: "Maximum reached",
        description: "XLS-56 batches support up to 8 transactions",
        variant: "destructive"
      });
      return;
    }

    const newTx: BatchTransaction = {
      id: `tx_${Date.now()}`,
      order: transactions.length + 1,
      txType,
      params: {},
      status: "PENDING"
    };

    setTransactions([...transactions, newTx]);
    setSelectedTxIndex(transactions.length);
  };

  const removeTransaction = (index: number) => {
    const updated = transactions.filter((_, i) => i !== index).map((tx, i) => ({
      ...tx,
      order: i + 1
    }));
    setTransactions(updated);
    setSelectedTxIndex(null);
  };

  const updateTransactionParams = (index: number, params: Record<string, any>) => {
    const updated = [...transactions];
    updated[index] = { ...updated[index], params };
    setTransactions(updated);
  };

  const moveTransaction = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= transactions.length) return;

    const updated = [...transactions];
    [updated[fromIndex], updated[toIndex]] = [updated[toIndex], updated[fromIndex]];
    updated.forEach((tx, i) => tx.order = i + 1);
    setTransactions(updated);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a batch name",
        variant: "destructive"
      });
      return;
    }

    if (transactions.length === 0) {
      toast({
        title: "No transactions",
        description: "Add at least one transaction to the batch",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Batch submitted",
      description: `${name} with ${transactions.length} transactions`
    });
    navigate("/batch");
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your batch has been saved as a draft"
    });
    navigate("/batch");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/batch")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Batch Builder</h1>
          <p className="text-muted-foreground">Create an XLS-56 transaction batch (max 8 transactions)</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Transaction Palette */}
        <div className="col-span-3">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Transaction Types</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[500px]">
                <div className="space-y-1 p-2">
                  {availableTxTypes.map((txType) => (
                    <Button
                      key={txType}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => addTransaction(txType)}
                      disabled={transactions.length >= 8}
                    >
                      <div className="flex items-center gap-2">
                        {txTypeIcons[txType] || <Clock className="h-4 w-4" />}
                        <div>
                          <div className="text-sm font-medium">{batchableTxTypeLabels[txType]}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {batchableTxTypeDescriptions[txType]}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Center: Batch Sequence */}
        <div className="col-span-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Batch Sequence</CardTitle>
                <Badge variant="outline">{transactions.length}/8</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <Layers className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Click transaction types to add</p>
                  <p className="text-sm">Maximum 8 per batch</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx, index) => (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTxIndex === index ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedTxIndex(index)}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
                        {tx.order}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{batchableTxTypeLabels[tx.txType]}</div>
                        {Object.keys(tx.params).length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {Object.keys(tx.params).length} params configured
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); moveTransaction(index, "up"); }}
                          disabled={index === 0}
                        >
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={(e) => { e.stopPropagation(); removeTransaction(index); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Atomicity Mode */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Atomicity Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={atomicityMode} onValueChange={(v) => setAtomicityMode(v as BatchAtomicityMode)}>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(atomicityModeLabels) as BatchAtomicityMode[]).map((mode) => (
                    <Label key={mode} htmlFor={mode} className="cursor-pointer">
                      <div className={`p-3 rounded-lg border transition-colors ${
                        atomicityMode === mode ? "border-primary bg-primary/5" : ""
                      }`}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value={mode} id={mode} />
                          <span className="text-sm font-medium">{atomicityModeLabels[mode]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {atomicityModeDescriptions[mode]}
                        </p>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right: Configuration */}
        <div className="col-span-4">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Batch Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Batch Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Q1 Dividend Distribution"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this batch"
                  rows={2}
                />
              </div>

              {selectedTxIndex !== null && transactions[selectedTxIndex] && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">
                    Configure: {batchableTxTypeLabels[transactions[selectedTxIndex].txType]}
                  </h4>
                  <TransactionConfigForm
                    txType={transactions[selectedTxIndex].txType}
                    params={transactions[selectedTxIndex].params}
                    onChange={(params) => updateTransactionParams(selectedTxIndex, params)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center sticky bottom-0 bg-background py-4 border-t">
        <Button variant="outline" onClick={handleSaveDraft}>
          Save as Draft
        </Button>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-4 py-2">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </Badge>
          {canSubmitBatch(role) && (
            <Button onClick={handleSubmit} disabled={transactions.length === 0}>
              <Send className="h-4 w-4 mr-2" />
              Submit Batch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchBuilder;

// Import the Layers icon that's used in the empty state
import { Layers } from "lucide-react";
