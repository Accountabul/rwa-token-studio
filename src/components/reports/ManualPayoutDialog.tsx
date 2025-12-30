import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  Upload,
  DollarSign,
  FileText,
  Link as LinkIcon,
  X,
  ChevronDown,
  CalendarIcon,
  Send,
  Wallet,
  CreditCard,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PayeeTypeahead } from "./PayeeTypeahead";
import { ReAuthModal } from "./ReAuthModal";
import {
  Payee,
  PayoutCurrency,
  PaymentMethod,
  CheckRequestDetails,
  FIAT_CURRENCIES,
  STABLECOIN_CURRENCIES,
  getCurrencySymbol,
  getCurrencyPrecision,
  isStablecoin,
  EvidenceType,
  PayeeMailingAddress,
} from "@/types/payout";
import { EarningCategory } from "@/types/reportsAndLogs";
import { usePayeeService, usePayoutRequestService } from "@/domain/ServiceContext";
import { Role } from "@/types/tokenization";

interface ManualPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (requestId: string) => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: Role;
}

interface EvidenceItem {
  id: string;
  type: EvidenceType;
  value: string; // URL or filename
  filename?: string;
}

const EARNING_CATEGORIES: { value: EarningCategory; label: string }[] = [
  { value: "CONTRACTOR_COMP", label: "Contractor Compensation" },
  { value: "VENDOR_PAYOUT", label: "Vendor Payout" },
  { value: "TIP", label: "Tip" },
  { value: "BOUNTY", label: "Bounty" },
  { value: "REFERRAL_REWARD", label: "Referral Reward" },
  { value: "OTHER", label: "Other" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "RECORD_ONLY",
    label: "Record Only",
    icon: <FileCheck className="w-4 h-4" />,
    description: "Record payout made externally",
  },
  {
    value: "SEND_CHECK",
    label: "Send Check",
    icon: <CreditCard className="w-4 h-4" />,
    description: "Mail a physical check",
  },
  {
    value: "CRYPTO_PAYOUT",
    label: "Crypto Payout",
    icon: <Wallet className="w-4 h-4" />,
    description: "Send stablecoin (RLUSD)",
  },
];

export const ManualPayoutDialog: React.FC<ManualPayoutDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  currentUserId = "user-001",
  currentUserName = "Current User",
  currentUserRole = "FINANCE_OFFICER",
}) => {
  const payeeService = usePayeeService();
  const payoutRequestService = usePayoutRequestService();

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayee, setSelectedPayee] = useState<Payee | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<PayoutCurrency>("USD");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RECORD_ONLY");
  const [earningCategory, setEarningCategory] = useState<EarningCategory>("CONTRACTOR_COMP");
  const [memo, setMemo] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [projectId, setProjectId] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [neededByDate, setNeededByDate] = useState<Date | undefined>();
  const [destinationWallet, setDestinationWallet] = useState("");

  // Check details
  const [checkMailingName, setCheckMailingName] = useState("");
  const [checkStreet, setCheckStreet] = useState("");
  const [checkCity, setCheckCity] = useState("");
  const [checkState, setCheckState] = useState("");
  const [checkZip, setCheckZip] = useState("");
  const [checkCountry, setCheckCountry] = useState("USA");
  const [checkDeliveryMethod, setCheckDeliveryMethod] = useState<"STANDARD" | "EXPEDITED">("STANDARD");
  const [checkMemo, setCheckMemo] = useState("");

  // Evidence
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [linkInput, setLinkInput] = useState("");

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showReAuth, setShowReAuth] = useState(false);
  const [accountingOpen, setAccountingOpen] = useState(false);

  // Populate check details from payee
  const handlePayeeChange = useCallback((payee: Payee | null) => {
    setSelectedPayee(payee);
    if (payee?.mailingAddress) {
      setCheckMailingName(payee.name);
      setCheckStreet(payee.mailingAddress.street);
      setCheckCity(payee.mailingAddress.city);
      setCheckState(payee.mailingAddress.state);
      setCheckZip(payee.mailingAddress.zip);
      setCheckCountry(payee.mailingAddress.country);
    }
    if (payee?.defaultWalletAddress) {
      setDestinationWallet(payee.defaultWalletAddress);
    }
  }, []);

  // Add evidence link
  const addEvidenceLink = () => {
    if (!linkInput.trim()) return;
    try {
      new URL(linkInput);
      setEvidenceItems([
        ...evidenceItems,
        { id: `evidence-${Date.now()}`, type: "LINK", value: linkInput.trim() },
      ]);
      setLinkInput("");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  // Simulate file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Unsupported file type: ${file.name}`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max 25MB)`);
        return;
      }
      setEvidenceItems([
        ...evidenceItems,
        {
          id: `evidence-${Date.now()}-${Math.random()}`,
          type: "UPLOAD",
          value: URL.createObjectURL(file),
          filename: file.name,
        },
      ]);
    });
    e.target.value = "";
  };

  const removeEvidence = (id: string) => {
    setEvidenceItems(evidenceItems.filter((e) => e.id !== id));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPayee) {
      newErrors.payee = "Payee is required";
    } else if (selectedPayee.status === "INACTIVE") {
      newErrors.payee = "Cannot submit payout to inactive payee";
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = "Valid amount is required";
    }

    if (!memo.trim() || memo.trim().length < 10) {
      newErrors.memo = "Memo must be at least 10 characters";
    }

    if (evidenceItems.length === 0) {
      newErrors.evidence = "At least one evidence document is required";
    }

    if (paymentMethod === "CRYPTO_PAYOUT") {
      if (!destinationWallet.trim()) {
        newErrors.wallet = "Destination wallet address is required";
      }
      if (!isStablecoin(currency)) {
        newErrors.currency = "Stablecoin currency required for crypto payouts";
      }
    }

    if (paymentMethod === "SEND_CHECK") {
      if (!checkMailingName.trim()) newErrors.checkName = "Mailing name required";
      if (!checkStreet.trim()) newErrors.checkStreet = "Street address required";
      if (!checkCity.trim()) newErrors.checkCity = "City required";
      if (!checkState.trim()) newErrors.checkState = "State required";
      if (!checkZip.trim()) newErrors.checkZip = "ZIP code required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if re-auth is needed
  const needsReAuth = (): boolean => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount >= 10000) return true;
    if (selectedPayee?.verificationStatus !== "VERIFIED") return true;
    if (isStablecoin(currency)) return true;
    return false;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (needsReAuth()) {
      setShowReAuth(true);
      return;
    }

    await submitRequest();
  };

  const submitRequest = async () => {
    setIsLoading(true);
    try {
      const checkDetails: CheckRequestDetails | undefined =
        paymentMethod === "SEND_CHECK"
          ? {
              mailingName: checkMailingName,
              mailingAddress: {
                street: checkStreet,
                city: checkCity,
                state: checkState,
                zip: checkZip,
                country: checkCountry,
              },
              deliveryMethod: checkDeliveryMethod,
              checkMemo: checkMemo || undefined,
              neededByDate: neededByDate?.toISOString(),
            }
          : undefined;

      // Create the request
      const request = await payoutRequestService.createDraft({
        requesterId: currentUserId,
        requesterName: currentUserName,
        requesterRole: currentUserRole,
        payeeId: selectedPayee!.id,
        payeeNameSnapshot: selectedPayee!.name,
        payeeTypeSnapshot: selectedPayee!.type,
        payeeVerificationStatus: selectedPayee!.verificationStatus,
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        category: earningCategory,
        memo,
        costCenter: costCenter || undefined,
        projectId: projectId || undefined,
        referenceId: referenceId || undefined,
        destinationWalletAddress: paymentMethod === "CRYPTO_PAYOUT" ? destinationWallet : undefined,
        neededByDate: neededByDate?.toISOString(),
        checkDetails,
      });

      // Add evidence
      for (const evidence of evidenceItems) {
        if (evidence.type === "LINK") {
          await payoutRequestService.addEvidenceLink(
            request.id,
            evidence.value,
            currentUserId,
            currentUserName
          );
        } else {
          await payoutRequestService.addEvidenceUpload(
            request.id,
            evidence.filename || "document",
            "application/octet-stream",
            0,
            currentUserId,
            currentUserName
          );
        }
      }

      // Submit for approval
      await payoutRequestService.submitRequest(
        request.id,
        currentUserId,
        currentUserName,
        currentUserRole,
        needsReAuth()
      );

      toast.success("Payout request submitted for approval");
      onSubmit?.(request.id);
      handleClose();
    } catch (error) {
      console.error("Failed to submit payout request:", error);
      toast.error("Failed to submit payout request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setSelectedPayee(null);
    setAmount("");
    setCurrency("USD");
    setPaymentMethod("RECORD_ONLY");
    setEarningCategory("CONTRACTOR_COMP");
    setMemo("");
    setCostCenter("");
    setProjectId("");
    setReferenceId("");
    setNeededByDate(undefined);
    setDestinationWallet("");
    setCheckMailingName("");
    setCheckStreet("");
    setCheckCity("");
    setCheckState("");
    setCheckZip("");
    setCheckCountry("USA");
    setCheckDeliveryMethod("STANDARD");
    setCheckMemo("");
    setEvidenceItems([]);
    setLinkInput("");
    setErrors({});
    onOpenChange(false);
  };

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Record Manual Payout
            </DialogTitle>
            <DialogDescription>
              Submit a payout request for approval. Evidence documentation is
              required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Warning Banner */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-700">
                <p className="font-medium">Approval Required</p>
                <p className="mt-0.5">
                  This request will be submitted for finance approval before
                  payment is executed.
                </p>
              </div>
            </div>

            {/* Payee Selection */}
            <div className="space-y-2">
              <Label>
                Payee <span className="text-destructive">*</span>
              </Label>
              <PayeeTypeahead
                value={selectedPayee}
                onChange={handlePayeeChange}
                canCreatePayee={false}
              />
              {selectedPayee?.verificationStatus !== "VERIFIED" && selectedPayee && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  Unverified payee - additional review required
                </div>
              )}
              {errors.payee && (
                <p className="text-xs text-destructive">{errors.payee}</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>
                Payment Method <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.value);
                      if (method.value === "CRYPTO_PAYOUT" && !isStablecoin(currency)) {
                        setCurrency("RLUSD");
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors text-center",
                      paymentMethod === method.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {method.icon}
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="amount">
                  Amount <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {currencySymbol}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step={1 / Math.pow(10, getCurrencyPrecision(currency))}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                  />
                </div>
                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={currency}
                  onValueChange={(v) => setCurrency(v as PayoutCurrency)}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Fiat</SelectLabel>
                      {FIAT_CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Stablecoins</SelectLabel>
                      {STABLECOIN_CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-xs text-destructive">{errors.currency}</p>
                )}
              </div>
            </div>

            {/* Crypto Wallet Address */}
            {paymentMethod === "CRYPTO_PAYOUT" && (
              <div className="space-y-2">
                <Label htmlFor="wallet">
                  Destination Wallet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="wallet"
                  placeholder="r..."
                  value={destinationWallet}
                  onChange={(e) => setDestinationWallet(e.target.value)}
                />
                {errors.wallet && (
                  <p className="text-xs text-destructive">{errors.wallet}</p>
                )}
              </div>
            )}

            {/* Check Details */}
            {paymentMethod === "SEND_CHECK" && (
              <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                <p className="text-sm font-medium">Check Details</p>
                <div className="space-y-2">
                  <Label htmlFor="checkName">Mailing Name *</Label>
                  <Input
                    id="checkName"
                    value={checkMailingName}
                    onChange={(e) => setCheckMailingName(e.target.value)}
                  />
                  {errors.checkName && (
                    <p className="text-xs text-destructive">{errors.checkName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkStreet">Street Address *</Label>
                  <Input
                    id="checkStreet"
                    value={checkStreet}
                    onChange={(e) => setCheckStreet(e.target.value)}
                  />
                  {errors.checkStreet && (
                    <p className="text-xs text-destructive">{errors.checkStreet}</p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="checkCity">City *</Label>
                    <Input
                      id="checkCity"
                      value={checkCity}
                      onChange={(e) => setCheckCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="checkState">State *</Label>
                    <Input
                      id="checkState"
                      value={checkState}
                      onChange={(e) => setCheckState(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="checkZip">ZIP *</Label>
                    <Input
                      id="checkZip"
                      value={checkZip}
                      onChange={(e) => setCheckZip(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Delivery</Label>
                    <Select
                      value={checkDeliveryMethod}
                      onValueChange={(v) => setCheckDeliveryMethod(v as "STANDARD" | "EXPEDITED")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="EXPEDITED">Expedited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Check Memo</Label>
                    <Input
                      value={checkMemo}
                      onChange={(e) => setCheckMemo(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Earning Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Earning Category</Label>
              <Select
                value={earningCategory}
                onValueChange={(v) => setEarningCategory(v as EarningCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EARNING_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">
                Memo / Description <span className="text-destructive">*</span>
                <span className="text-muted-foreground text-xs ml-2">
                  (min 10 characters)
                </span>
              </Label>
              <Textarea
                id="memo"
                placeholder="Describe the purpose of this payout..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              {errors.memo && (
                <p className="text-xs text-destructive">{errors.memo}</p>
              )}
            </div>

            {/* Accounting Details (Collapsible) */}
            <Collapsible open={accountingOpen} onOpenChange={setAccountingOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="text-sm">Accounting Details</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      accountingOpen && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="costCenter">Cost Center</Label>
                    <Input
                      id="costCenter"
                      placeholder="e.g., DEPT-100"
                      value={costCenter}
                      onChange={(e) => setCostCenter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="projectId">Project ID</Label>
                    <Input
                      id="projectId"
                      placeholder="e.g., PROJ-2024-001"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="refId">Reference ID (Invoice/PO)</Label>
                    <Input
                      id="refId"
                      placeholder="e.g., INV-12345"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Needed By Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !neededByDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {neededByDate ? format(neededByDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={neededByDate}
                          onSelect={setNeededByDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Evidence Documents */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Evidence Document <span className="text-destructive">*</span>
                <Badge variant="outline" className="text-[10px]">
                  Required
                </Badge>
              </Label>

              <Tabs defaultValue="link" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="link">
                    <LinkIcon className="w-3.5 h-3.5 mr-1" />
                    Link
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="link" className="mt-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEvidenceLink())}
                    />
                    <Button type="button" variant="secondary" onClick={addEvidenceLink}>
                      Add
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="upload" className="mt-2">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">
                          PDF, PNG, JPG, DOCX (max 25MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        multiple
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Evidence List */}
              {evidenceItems.length > 0 && (
                <div className="space-y-1 mt-2">
                  {evidenceItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm"
                    >
                      {item.type === "LINK" ? (
                        <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span className="flex-1 truncate text-xs">
                        {item.filename || item.value}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeEvidence(item.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {errors.evidence && (
                <p className="text-xs text-destructive">{errors.evidence}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit for Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-auth Modal */}
      <ReAuthModal
        open={showReAuth}
        onOpenChange={setShowReAuth}
        onConfirm={submitRequest}
        reason={
          parseFloat(amount) >= 10000
            ? "High-value payout requires identity confirmation"
            : isStablecoin(currency)
            ? "Stablecoin payouts require identity confirmation"
            : "Unverified payee requires identity confirmation"
        }
      />
    </>
  );
};
