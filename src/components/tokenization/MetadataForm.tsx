import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { assetClassLabel, realEstateSubclassLabel, AssetClass, RealEstateSubclass } from "@/types/tokenization";
import { Lock } from "lucide-react";

interface XLS89Metadata {
  t: string;
  n: string;
  d: string;
  i: string;
  ac: string;
  as: string;
  in: string;
  us?: string[];
  ai?: {
    val?: number;
    ccy?: string;
    asof?: string;
    lockup?: string;
    compliance?: string;
  };
}

interface MetadataFormProps {
  metadata: string;
  onChange: (metadata: string) => void;
}

interface FieldConfig {
  key: keyof XLS89Metadata;
  label: string;
  description: string;
  maxChars: number;
  type: "text" | "textarea" | "select" | "readonly";
  options?: { value: string; label: string }[];
}

// Build options from the taxonomy
const assetClassOptions = Object.entries(assetClassLabel).map(([value, label]) => ({
  value,
  label,
}));

const subclassOptions = Object.entries(realEstateSubclassLabel).map(([value, label]) => ({
  value,
  label,
}));

const fields: FieldConfig[] = [
  { key: "t", label: "Token Code", description: "Short ticker symbol (e.g., ABUL-MAPLE-01)", maxChars: 20, type: "text" },
  { key: "n", label: "Token Name", description: "Human-readable token name", maxChars: 50, type: "text" },
  { key: "d", label: "Description", description: "Brief description of the tokenized asset", maxChars: 200, type: "textarea" },
  { key: "i", label: "Image URI", description: "IPFS or HTTP link to token image", maxChars: 100, type: "text" },
  { 
    key: "ac", 
    label: "Asset Class", 
    description: "High-level asset category", 
    maxChars: 10, 
    type: "select",
    options: assetClassOptions,
  },
  { 
    key: "as", 
    label: "Asset Subclass", 
    description: "Specific real estate type", 
    maxChars: 15, 
    type: "select",
    options: subclassOptions,
  },
  { 
    key: "in", 
    label: "Token Issuer", 
    description: "Accountabul issues all tokens on the XRPL", 
    maxChars: 50, 
    type: "readonly" 
  },
];

const MAX_TOTAL_BYTES = 1000;

export const MetadataForm: React.FC<MetadataFormProps> = ({ metadata, onChange }) => {
  const parsed = useMemo<XLS89Metadata>(() => {
    try {
      const obj = JSON.parse(metadata);
      return {
        t: obj.t || "",
        n: obj.n || "",
        d: obj.d || "",
        i: obj.i || "",
        ac: obj.ac || "rwa_re",
        as: obj.as || "",
        in: obj.in || "Accountabul",
        us: obj.us || [],
        ai: obj.ai || {},
      };
    } catch {
      return { t: "", n: "", d: "", i: "", ac: "rwa_re", as: "", in: "Accountabul", us: [], ai: {} };
    }
  }, [metadata]);

  const totalBytes = useMemo(() => {
    return new Blob([metadata]).size;
  }, [metadata]);

  const bytesPercent = Math.min((totalBytes / MAX_TOTAL_BYTES) * 100, 100);

  const handleFieldChange = (key: keyof XLS89Metadata, value: string) => {
    const updated = { ...parsed, [key]: value };
    onChange(JSON.stringify(updated, null, 2));
  };

  const getCharCount = (value: string | undefined) => value?.length || 0;

  return (
    <div className="space-y-5">
      {/* Total Bytes Indicator */}
      <div className="bg-muted/50 rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-foreground">Total Metadata Size</span>
          <span className={cn(
            "text-xs font-semibold",
            bytesPercent > 90 ? "text-destructive" : bytesPercent > 70 ? "text-yellow-600" : "text-primary"
          )}>
            {totalBytes} / {MAX_TOTAL_BYTES} bytes
          </span>
        </div>
        <Progress 
          value={bytesPercent} 
          className={cn(
            "h-2",
            bytesPercent > 90 ? "[&>div]:bg-destructive" : bytesPercent > 70 ? "[&>div]:bg-yellow-500" : ""
          )} 
        />
        <p className="text-[10px] text-muted-foreground mt-2">
          XLS-89 metadata is stored on-ledger and should stay under ~1000 bytes for optimal performance.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.map((field) => {
          const value = parsed[field.key] as string || "";
          const charCount = getCharCount(value);
          const charPercent = (charCount / field.maxChars) * 100;
          const isOverLimit = charCount > field.maxChars;

          return (
            <div key={field.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{field.key}</code>
                  {field.label}
                  {field.type === "readonly" && <Lock className="w-3 h-3 text-muted-foreground" />}
                </label>
                <span className={cn(
                  "text-[10px] font-medium",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}>
                  {charCount}/{field.maxChars}
                </span>
              </div>
              
              {field.type === "readonly" ? (
                <div className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-medium text-foreground">{value || "Accountabul"}</span>
                  <span className="text-[10px]">(fixed)</span>
                </div>
              ) : field.type === "select" ? (
                <Select value={value} onValueChange={(v) => handleFieldChange(field.key, v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={value}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className={cn(
                    "w-full rounded-lg border bg-background px-3 py-2 text-xs min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all duration-200",
                    isOverLimit ? "border-destructive" : "border-input"
                  )}
                  placeholder={field.description}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className={cn(
                    "w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all duration-200",
                    isOverLimit ? "border-destructive" : "border-input"
                  )}
                  placeholder={field.description}
                />
              )}
              
              {field.type !== "readonly" && (
                <div className="flex items-center gap-2">
                  <Progress 
                    value={Math.min(charPercent, 100)} 
                    className={cn(
                      "h-1 flex-1",
                      isOverLimit ? "[&>div]:bg-destructive" : charPercent > 80 ? "[&>div]:bg-yellow-500" : ""
                    )} 
                  />
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">{field.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
