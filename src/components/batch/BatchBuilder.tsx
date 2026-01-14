import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/types/tokenization";
import { IssuingWallet } from "@/types/token";
import {
  BatchAtomicityMode,
  BatchableTxType,
  BatchTransaction,
  TxCategory,
  atomicityModeLabels,
  atomicityModeDescriptions,
  batchableTxTypeLabels,
  batchableTxTypeDescriptions,
  categoryLabels,
  categoryDescriptions,
  txTypeToCategory,
  getOrderedCategories,
  getTxTypesForCategory,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft, Plus, Trash2, GripVertical, ArrowUpDown, Send, Search,
  Coins, Link, FileText, Lock, Unlock, Image, Shield, Clock, Layers,
  UserCog, ArrowRightLeft, Droplets, GitBranch, Ticket, Code, X,
  Ban, Key, Users, ShieldCheck, CreditCard, ImagePlus, ImageMinus, Tag, CheckSquare,
  AlertTriangle, Wallet
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TransactionConfigForm from "./TransactionConfigForm";
import { BatchSigningFlow } from "./BatchSigningFlow";
import { KeyStorageTypeBadge } from "@/components/custody/KeyStorageTypeBadge";
import { SigningPolicyPreview } from "@/components/custody/SigningPolicyPreview";
import { requiresMigration } from "@/types/custody";
import { mockWallets } from "@/data/mockWallets";

interface BatchBuilderProps {
  role: Role;
}

// Icons for each transaction type
const txTypeIcons: Record<BatchableTxType, React.ReactNode> = {
  // Account
  AccountDelete: <Ban className="h-4 w-4" />,
  AccountSet: <UserCog className="h-4 w-4" />,
  SetRegularKey: <Key className="h-4 w-4" />,
  SignerListSet: <Users className="h-4 w-4" />,
  DepositPreauth: <ShieldCheck className="h-4 w-4" />,
  // Payments
  Payment: <Coins className="h-4 w-4" />,
  // Trust
  TrustSet: <Link className="h-4 w-4" />,
  // DEX
  OfferCreate: <ArrowRightLeft className="h-4 w-4" />,
  OfferCancel: <X className="h-4 w-4" />,
  // AMM
  AMMBid: <Droplets className="h-4 w-4" />,
  AMMDeposit: <Plus className="h-4 w-4" />,
  AMMWithdraw: <ArrowLeft className="h-4 w-4" />,
  AMMVote: <CheckSquare className="h-4 w-4" />,
  // Escrow
  EscrowCreate: <Lock className="h-4 w-4" />,
  EscrowFinish: <Unlock className="h-4 w-4" />,
  EscrowCancel: <X className="h-4 w-4" />,
  // Checks
  CheckCreate: <FileText className="h-4 w-4" />,
  CheckCash: <CreditCard className="h-4 w-4" />,
  CheckCancel: <X className="h-4 w-4" />,
  // Payment Channels
  PaymentChannelCreate: <GitBranch className="h-4 w-4" />,
  PaymentChannelClaim: <Coins className="h-4 w-4" />,
  PaymentChannelFund: <Plus className="h-4 w-4" />,
  // NFToken
  NFTokenMint: <ImagePlus className="h-4 w-4" />,
  NFTokenBurn: <ImageMinus className="h-4 w-4" />,
  NFTokenCreateOffer: <Tag className="h-4 w-4" />,
  NFTokenAcceptOffer: <CheckSquare className="h-4 w-4" />,
  NFTokenCancelOffer: <X className="h-4 w-4" />,
  // Tickets
  TicketCreate: <Ticket className="h-4 w-4" />,
  // Custom
  ContractCall: <Code className="h-4 w-4" />,
};

// Icons for each category
const categoryIcons: Record<TxCategory, React.ReactNode> = {
  ACCOUNT: <UserCog className="h-4 w-4" />,
  PAYMENTS: <Coins className="h-4 w-4" />,
  TRUST: <Link className="h-4 w-4" />,
  DEX: <ArrowRightLeft className="h-4 w-4" />,
  AMM: <Droplets className="h-4 w-4" />,
  ESCROW: <Lock className="h-4 w-4" />,
  CHECKS: <FileText className="h-4 w-4" />,
  PAYMENT_CHANNELS: <GitBranch className="h-4 w-4" />,
  NFTOKEN: <Image className="h-4 w-4" />,
  TICKETS: <Ticket className="h-4 w-4" />,
  CUSTOM: <Code className="h-4 w-4" />,
};

const BatchBuilder = ({ role }: BatchBuilderProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [atomicityMode, setAtomicityMode] = useState<BatchAtomicityMode>("ALL_OR_NOTHING");
  const [transactions, setTransactions] = useState<BatchTransaction[]>([]);
  const [selectedTxIndex, setSelectedTxIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New state for wallet selection and signing flow
  const [wallets, setWallets] = useState<IssuingWallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [showSigningFlow, setShowSigningFlow] = useState(false);

  // Load wallets on mount
  useEffect(() => {
    // Filter to active wallets that can sign
    const activeWallets = mockWallets.filter(
      (w) => w.status === "ACTIVE" && (w.role === "ISSUER" || w.role === "TREASURY" || w.role === "OPS")
    );
    setWallets(activeWallets);
  }, []);

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  // Filter transaction types by search
  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const categories = getOrderedCategories();
    
    if (!query) return categories;
    
    return categories.filter(category => {
      const types = getTxTypesForCategory(category);
      return types.some(type => 
        batchableTxTypeLabels[type].toLowerCase().includes(query) ||
        batchableTxTypeDescriptions[type].toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const getFilteredTypesForCategory = (category: TxCategory): BatchableTxType[] => {
    const types = getTxTypesForCategory(category);
    if (!searchQuery) return types;
    
    const query = searchQuery.toLowerCase();
    return types.filter(type =>
      batchableTxTypeLabels[type].toLowerCase().includes(query) ||
      batchableTxTypeDescriptions[type].toLowerCase().includes(query)
    );
  };

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

    if (!selectedWallet) {
      toast({
        title: "Select a wallet",
        description: "Please select a signing wallet for this batch",
        variant: "destructive"
      });
      return;
    }

    // Open the signing flow dialog
    setShowSigningFlow(true);
  };

  const handleSigningComplete = (results: Array<{ tx: BatchTransaction; response: any }>) => {
    const successCount = results.filter((r) => r.response.success).length;
    if (successCount === transactions.length) {
      navigate("/batch");
    }
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
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[500px]">
                <Accordion type="multiple" defaultValue={getOrderedCategories()} className="px-2">
                  {filteredCategories.map((category) => {
                    const types = getFilteredTypesForCategory(category);
                    if (types.length === 0) return null;
                    
                    return (
                      <AccordionItem key={category} value={category} className="border-b-0">
                        <AccordionTrigger className="py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            {categoryIcons[category]}
                            <span className="text-sm font-medium">{categoryLabels[category]}</span>
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                              {types.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="space-y-1">
                            {types.map((txType) => (
                              <Button
                                key={txType}
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-2 px-2"
                                onClick={() => addTransaction(txType)}
                                disabled={transactions.length >= 8}
                              >
                                <div className="flex items-center gap-2">
                                  {txTypeIcons[txType]}
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium truncate">{batchableTxTypeLabels[txType]}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                                      {batchableTxTypeDescriptions[txType]}
                                    </div>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
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
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {txTypeIcons[tx.txType]}
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{batchableTxTypeLabels[tx.txType]}</div>
                          {Object.keys(tx.params).length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {Object.keys(tx.params).length} params configured
                            </div>
                          )}
                        </div>
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

              {/* Wallet Selection */}
              <div className="space-y-2 border-t pt-4">
                <Label>Signing Wallet *</Label>
                <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a wallet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-3 w-3" />
                          <span>{w.name}</span>
                          <Badge variant="outline" className="text-[10px] ml-1">
                            {w.network}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedWallet && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <KeyStorageTypeBadge type={selectedWallet.keyStorageType} size="sm" />
                      <Badge variant="outline" className="text-xs capitalize">
                        {selectedWallet.role}
                      </Badge>
                    </div>

                    {requiresMigration(selectedWallet.keyStorageType) && (
                      <Alert className="bg-amber-500/10 border-amber-500/20">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-xs text-amber-700">
                          {selectedWallet.network === "mainnet"
                            ? "Legacy wallets cannot sign mainnet transactions."
                            : "Consider migrating to vault storage for enhanced security."}
                        </AlertDescription>
                      </Alert>
                    )}

                    {transactions.length > 0 && (
                      <SigningPolicyPreview
                        walletRole={selectedWallet.role}
                        network={selectedWallet.network}
                        txType={transactions[0].txType}
                        compact
                      />
                    )}
                  </div>
                )}
              </div>

              {selectedTxIndex !== null && transactions[selectedTxIndex] && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    {txTypeIcons[transactions[selectedTxIndex].txType]}
                    Configure: {batchableTxTypeLabels[transactions[selectedTxIndex].txType]}
                  </h4>
                  <ScrollArea className="h-[300px] pr-4">
                    <TransactionConfigForm
                      txType={transactions[selectedTxIndex].txType}
                      params={transactions[selectedTxIndex].params}
                      onChange={(params) => updateTransactionParams(selectedTxIndex, params)}
                    />
                  </ScrollArea>
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
