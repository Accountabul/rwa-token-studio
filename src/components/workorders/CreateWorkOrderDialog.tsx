import React, { useState } from "react";
import { Building2, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { mockBusinesses } from "@/data/mockBusinesses";
import { WorkOrderTokenType, CreateWorkOrderParams } from "@/types/workOrder";
import { useWorkOrderService } from "@/domain/ServiceContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreateWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3;

const categories = [
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "INSTALLATION", label: "Installation" },
  { value: "PROFESSIONAL_SERVICES", label: "Professional Services" },
  { value: "AUDIT", label: "Audit" },
];

export const CreateWorkOrderDialog: React.FC<CreateWorkOrderDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { profile, roles } = useAuth();
  const workOrderService = useWorkOrderService();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [businessId, setBusinessId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tokenType, setTokenType] = useState<WorkOrderTokenType>("NFT");
  const [agreedAmount, setAgreedAmount] = useState("");

  const selectedBusiness = mockBusinesses.find((b) => b.id === businessId);

  const resetForm = () => {
    setStep(1);
    setBusinessId("");
    setTitle("");
    setDescription("");
    setCategory("");
    setTokenType("NFT");
    setAgreedAmount("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const canProceedStep1 = businessId !== "";
  const canProceedStep2 =
    title.trim() !== "" && category !== "" && parseFloat(agreedAmount) > 0;

  const handleSubmit = async () => {
    if (!profile || !selectedBusiness) return;

    setIsSubmitting(true);
    try {
      const params: CreateWorkOrderParams = {
        businessId: selectedBusiness.id,
        businessName: selectedBusiness.name,
        title: title.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        tokenType,
        agreedAmountUsd: parseFloat(agreedAmount),
        currency: "USD",
        createdBy: profile.id,
        createdByName: profile.full_name,
      };

      await workOrderService.createWorkOrder(params, {
        userId: profile.id,
        name: profile.full_name,
        role: roles[0] || "OPERATIONS_ADMIN",
      });

      toast({
        title: "Work Order Created",
        description: `"${title}" has been created successfully.`,
      });

      handleClose();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Step 1: Business Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-medium">Select Business</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business">Business</Label>
              <Select value={businessId} onValueChange={setBusinessId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a business..." />
                </SelectTrigger>
                <SelectContent>
                  {mockBusinesses
                    .filter((b) => b.status === "ACTIVE")
                    .map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Work Order Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">Work Order Details</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter work order title..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the work to be performed..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Token Type *</Label>
              <RadioGroup
                value={tokenType}
                onValueChange={(v) => setTokenType(v as WorkOrderTokenType)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NFT" id="nft" />
                  <Label htmlFor="nft" className="cursor-pointer">
                    NFT (Unique)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MPT" id="mpt" />
                  <Label htmlFor="mpt" className="cursor-pointer">
                    MPT (Fungible)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Agreed Amount (USD) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={agreedAmount}
                onChange={(e) => setAgreedAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Create */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="font-medium">Review & Create</span>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business</span>
                <span className="font-medium">{selectedBusiness?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">
                  {categories.find((c) => c.value === category)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token Type</span>
                <span className="font-medium">{tokenType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ${parseFloat(agreedAmount).toLocaleString()}
                </span>
              </div>
              {description && (
                <div>
                  <span className="text-muted-foreground text-sm">
                    Description
                  </span>
                  <p className="text-sm mt-1">{description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Work Order"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
