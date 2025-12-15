import { BatchableTxType } from "@/types/batchTransaction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionConfigFormProps {
  txType: BatchableTxType;
  params: Record<string, any>;
  onChange: (params: Record<string, any>) => void;
}

const TransactionConfigForm = ({ txType, params, onChange }: TransactionConfigFormProps) => {
  const updateParam = (key: string, value: any) => {
    onChange({ ...params, [key]: value });
  };

  const renderFields = () => {
    switch (txType) {
      case "Payment":
        return (
          <>
            <div className="space-y-2">
              <Label>Destination *</Label>
              <Input
                value={params.destination || ""}
                onChange={(e) => updateParam("destination", e.target.value)}
                placeholder="rXXXXXXX..."
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                value={params.amount || ""}
                onChange={(e) => updateParam("amount", e.target.value)}
                placeholder="100.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={params.currency || "XRP"} onValueChange={(v) => updateParam("currency", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XRP">XRP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case "TrustSet":
        return (
          <>
            <div className="space-y-2">
              <Label>Currency Code *</Label>
              <Input
                value={params.currency || ""}
                onChange={(e) => updateParam("currency", e.target.value)}
                placeholder="USD"
              />
            </div>
            <div className="space-y-2">
              <Label>Issuer *</Label>
              <Input
                value={params.issuer || ""}
                onChange={(e) => updateParam("issuer", e.target.value)}
                placeholder="rXXXXXXX..."
              />
            </div>
            <div className="space-y-2">
              <Label>Limit</Label>
              <Input
                type="number"
                value={params.limit || ""}
                onChange={(e) => updateParam("limit", e.target.value)}
                placeholder="1000000"
              />
            </div>
          </>
        );

      case "EscrowCreate":
        return (
          <>
            <div className="space-y-2">
              <Label>Destination *</Label>
              <Input
                value={params.destination || ""}
                onChange={(e) => updateParam("destination", e.target.value)}
                placeholder="rXXXXXXX..."
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (XRP) *</Label>
              <Input
                type="number"
                value={params.amount || ""}
                onChange={(e) => updateParam("amount", e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label>Finish After (Date)</Label>
              <Input
                type="date"
                value={params.finishAfter || ""}
                onChange={(e) => updateParam("finishAfter", e.target.value)}
              />
            </div>
          </>
        );

      case "CheckCreate":
        return (
          <>
            <div className="space-y-2">
              <Label>Destination *</Label>
              <Input
                value={params.destination || ""}
                onChange={(e) => updateParam("destination", e.target.value)}
                placeholder="rXXXXXXX..."
              />
            </div>
            <div className="space-y-2">
              <Label>Send Max *</Label>
              <Input
                type="number"
                value={params.sendMax || ""}
                onChange={(e) => updateParam("sendMax", e.target.value)}
                placeholder="100.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiration (Date)</Label>
              <Input
                type="date"
                value={params.expiration || ""}
                onChange={(e) => updateParam("expiration", e.target.value)}
              />
            </div>
          </>
        );

      case "NFTokenMint":
        return (
          <>
            <div className="space-y-2">
              <Label>URI *</Label>
              <Input
                value={params.uri || ""}
                onChange={(e) => updateParam("uri", e.target.value)}
                placeholder="ipfs://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Taxon</Label>
              <Input
                type="number"
                value={params.taxon || ""}
                onChange={(e) => updateParam("taxon", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Transfer Fee (0-50000)</Label>
              <Input
                type="number"
                value={params.transferFee || ""}
                onChange={(e) => updateParam("transferFee", e.target.value)}
                placeholder="500"
                max={50000}
              />
            </div>
          </>
        );

      case "MPTokenAuthorize":
        return (
          <>
            <div className="space-y-2">
              <Label>Token ID *</Label>
              <Input
                value={params.tokenId || ""}
                onChange={(e) => updateParam("tokenId", e.target.value)}
                placeholder="MPT Token ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Holder Address *</Label>
              <Input
                value={params.holder || ""}
                onChange={(e) => updateParam("holder", e.target.value)}
                placeholder="rXXXXXXX..."
              />
            </div>
          </>
        );

      case "ContractCall":
        return (
          <>
            <div className="space-y-2">
              <Label>Contract Address *</Label>
              <Input
                value={params.contract || ""}
                onChange={(e) => updateParam("contract", e.target.value)}
                placeholder="rContract..."
              />
            </div>
            <div className="space-y-2">
              <Label>Function Name *</Label>
              <Input
                value={params.function || ""}
                onChange={(e) => updateParam("function", e.target.value)}
                placeholder="functionName"
              />
            </div>
            <div className="space-y-2">
              <Label>Arguments (JSON)</Label>
              <Input
                value={params.args || ""}
                onChange={(e) => updateParam("args", e.target.value)}
                placeholder='{"param1": "value1"}'
              />
            </div>
          </>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground text-center py-4">
            Configuration for {txType} coming soon
          </div>
        );
    }
  };

  return <div className="space-y-3">{renderFields()}</div>;
};

export default TransactionConfigForm;
