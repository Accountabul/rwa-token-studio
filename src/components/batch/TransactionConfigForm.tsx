import { BatchableTxType } from "@/types/batchTransaction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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
      // === ACCOUNT MANAGEMENT ===
      case "AccountDelete":
        return (
          <>
            <div className="space-y-2">
              <Label>Destination *</Label>
              <Input
                value={params.destination || ""}
                onChange={(e) => updateParam("destination", e.target.value)}
                placeholder="rXXXXXXX... (receives remaining XRP)"
              />
            </div>
            <div className="space-y-2">
              <Label>Destination Tag</Label>
              <Input
                type="number"
                value={params.destinationTag || ""}
                onChange={(e) => updateParam("destinationTag", e.target.value)}
                placeholder="Optional tag"
              />
            </div>
          </>
        );

      case "AccountSet":
        return (
          <>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Input
                value={params.domain || ""}
                onChange={(e) => updateParam("domain", e.target.value)}
                placeholder="example.com (hex-encoded)"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Hash</Label>
              <Input
                value={params.emailHash || ""}
                onChange={(e) => updateParam("emailHash", e.target.value)}
                placeholder="MD5 hash of email (lowercase)"
              />
            </div>
            <div className="space-y-2">
              <Label>Transfer Rate</Label>
              <Input
                type="number"
                value={params.transferRate || ""}
                onChange={(e) => updateParam("transferRate", e.target.value)}
                placeholder="1000000000 (no fee) to 2000000000"
              />
            </div>
            <div className="space-y-2">
              <Label>Tick Size (3-15)</Label>
              <Input
                type="number"
                value={params.tickSize || ""}
                onChange={(e) => updateParam("tickSize", e.target.value)}
                placeholder="0 to disable, 3-15 to set"
                min={0}
                max={15}
              />
            </div>
          </>
        );

      case "SetRegularKey":
        return (
          <div className="space-y-2">
            <Label>Regular Key</Label>
            <Input
              value={params.regularKey || ""}
              onChange={(e) => updateParam("regularKey", e.target.value)}
              placeholder="rXXXXXXX... (leave empty to remove)"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to remove the regular key
            </p>
          </div>
        );

      case "SignerListSet":
        return (
          <>
            <div className="space-y-2">
              <Label>Signer Quorum *</Label>
              <Input
                type="number"
                value={params.signerQuorum || ""}
                onChange={(e) => updateParam("signerQuorum", e.target.value)}
                placeholder="Required weight to approve (e.g., 2)"
              />
            </div>
            <div className="space-y-2">
              <Label>Signer Entries (JSON array)</Label>
              <Textarea
                value={params.signerEntries || ""}
                onChange={(e) => updateParam("signerEntries", e.target.value)}
                placeholder='[{"Account": "rXXX...", "SignerWeight": 1}]'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 quorum and empty array to remove signer list
              </p>
            </div>
          </>
        );

      case "DepositPreauth":
        return (
          <>
            <div className="space-y-2">
              <Label>Authorize Address</Label>
              <Input
                value={params.authorize || ""}
                onChange={(e) => updateParam("authorize", e.target.value)}
                placeholder="rXXXXXXX... (to authorize)"
              />
            </div>
            <div className="space-y-2">
              <Label>Unauthorize Address</Label>
              <Input
                value={params.unauthorize || ""}
                onChange={(e) => updateParam("unauthorize", e.target.value)}
                placeholder="rXXXXXXX... (to remove auth)"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Provide either Authorize OR Unauthorize, not both
            </p>
          </>
        );

      // === PAYMENTS ===
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
            <div className="space-y-2">
              <Label>Destination Tag</Label>
              <Input
                type="number"
                value={params.destinationTag || ""}
                onChange={(e) => updateParam("destinationTag", e.target.value)}
                placeholder="Optional tag"
              />
            </div>
          </>
        );

      // === TRUST LINES ===
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
            <div className="space-y-2">
              <Label>Quality In</Label>
              <Input
                type="number"
                value={params.qualityIn || ""}
                onChange={(e) => updateParam("qualityIn", e.target.value)}
                placeholder="0 for default"
              />
            </div>
            <div className="space-y-2">
              <Label>Quality Out</Label>
              <Input
                type="number"
                value={params.qualityOut || ""}
                onChange={(e) => updateParam("qualityOut", e.target.value)}
                placeholder="0 for default"
              />
            </div>
          </>
        );

      // === DEX / OFFERS ===
      case "OfferCreate":
        return (
          <>
            <div className="space-y-2">
              <Label>Taker Gets Amount *</Label>
              <Input
                type="number"
                value={params.takerGetsValue || ""}
                onChange={(e) => updateParam("takerGetsValue", e.target.value)}
                placeholder="Amount you're selling"
              />
            </div>
            <div className="space-y-2">
              <Label>Taker Gets Currency</Label>
              <Input
                value={params.takerGetsCurrency || "XRP"}
                onChange={(e) => updateParam("takerGetsCurrency", e.target.value)}
                placeholder="XRP or currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Taker Pays Amount *</Label>
              <Input
                type="number"
                value={params.takerPaysValue || ""}
                onChange={(e) => updateParam("takerPaysValue", e.target.value)}
                placeholder="Amount you want"
              />
            </div>
            <div className="space-y-2">
              <Label>Taker Pays Currency</Label>
              <Input
                value={params.takerPaysCurrency || "USD"}
                onChange={(e) => updateParam("takerPaysCurrency", e.target.value)}
                placeholder="Currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiration (Date)</Label>
              <Input
                type="datetime-local"
                value={params.expiration || ""}
                onChange={(e) => updateParam("expiration", e.target.value)}
              />
            </div>
          </>
        );

      case "OfferCancel":
        return (
          <div className="space-y-2">
            <Label>Offer Sequence *</Label>
            <Input
              type="number"
              value={params.offerSequence || ""}
              onChange={(e) => updateParam("offerSequence", e.target.value)}
              placeholder="Sequence number of offer to cancel"
            />
          </div>
        );

      // === AMM ===
      case "AMMBid":
        return (
          <>
            <div className="space-y-2">
              <Label>Asset 1 Currency *</Label>
              <Input
                value={params.asset1Currency || "XRP"}
                onChange={(e) => updateParam("asset1Currency", e.target.value)}
                placeholder="XRP or currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 1 Issuer</Label>
              <Input
                value={params.asset1Issuer || ""}
                onChange={(e) => updateParam("asset1Issuer", e.target.value)}
                placeholder="rXXXXXXX... (for non-XRP)"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 2 Currency *</Label>
              <Input
                value={params.asset2Currency || ""}
                onChange={(e) => updateParam("asset2Currency", e.target.value)}
                placeholder="Currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 2 Issuer *</Label>
              <Input
                value={params.asset2Issuer || ""}
                onChange={(e) => updateParam("asset2Issuer", e.target.value)}
                placeholder="rXXXXXXX..."
              />
            </div>
            <div className="space-y-2">
              <Label>Bid Min (LP tokens)</Label>
              <Input
                type="number"
                value={params.bidMin || ""}
                onChange={(e) => updateParam("bidMin", e.target.value)}
                placeholder="Minimum bid amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Bid Max (LP tokens)</Label>
              <Input
                type="number"
                value={params.bidMax || ""}
                onChange={(e) => updateParam("bidMax", e.target.value)}
                placeholder="Maximum bid amount"
              />
            </div>
          </>
        );

      case "AMMDeposit":
        return (
          <>
            <div className="space-y-2">
              <Label>Asset 1 Currency *</Label>
              <Input
                value={params.asset1Currency || "XRP"}
                onChange={(e) => updateParam("asset1Currency", e.target.value)}
                placeholder="XRP or currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 1 Issuer</Label>
              <Input
                value={params.asset1Issuer || ""}
                onChange={(e) => updateParam("asset1Issuer", e.target.value)}
                placeholder="rXXXXXXX... (for non-XRP)"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 2 Currency *</Label>
              <Input
                value={params.asset2Currency || ""}
                onChange={(e) => updateParam("asset2Currency", e.target.value)}
                placeholder="Currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 2 Issuer *</Label>
              <Input
                value={params.asset2Issuer || ""}
                onChange={(e) => updateParam("asset2Issuer", e.target.value)}
                placeholder="rXXXXXXX..."
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={params.amount || ""}
                onChange={(e) => updateParam("amount", e.target.value)}
                placeholder="Amount of asset 1 to deposit"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount 2</Label>
              <Input
                type="number"
                value={params.amount2 || ""}
                onChange={(e) => updateParam("amount2", e.target.value)}
                placeholder="Amount of asset 2 to deposit"
              />
            </div>
            <div className="space-y-2">
              <Label>LP Token Out</Label>
              <Input
                type="number"
                value={params.lpTokenOut || ""}
                onChange={(e) => updateParam("lpTokenOut", e.target.value)}
                placeholder="LP tokens to receive"
              />
            </div>
          </>
        );

      case "AMMWithdraw":
        return (
          <>
            <div className="space-y-2">
              <Label>Asset 1 Currency *</Label>
              <Input
                value={params.asset1Currency || "XRP"}
                onChange={(e) => updateParam("asset1Currency", e.target.value)}
                placeholder="XRP or currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 1 Issuer</Label>
              <Input
                value={params.asset1Issuer || ""}
                onChange={(e) => updateParam("asset1Issuer", e.target.value)}
                placeholder="rXXXXXXX... (for non-XRP)"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 2 Currency *</Label>
              <Input
                value={params.asset2Currency || ""}
                onChange={(e) => updateParam("asset2Currency", e.target.value)}
                placeholder="Currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 2 Issuer *</Label>
              <Input
                value={params.asset2Issuer || ""}
                onChange={(e) => updateParam("asset2Issuer", e.target.value)}
                placeholder="rXXXXXXX..."
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={params.amount || ""}
                onChange={(e) => updateParam("amount", e.target.value)}
                placeholder="Amount of asset 1 to withdraw"
              />
            </div>
            <div className="space-y-2">
              <Label>LP Token In</Label>
              <Input
                type="number"
                value={params.lpTokenIn || ""}
                onChange={(e) => updateParam("lpTokenIn", e.target.value)}
                placeholder="LP tokens to burn"
              />
            </div>
          </>
        );

      case "AMMVote":
        return (
          <>
            <div className="space-y-2">
              <Label>Asset 1 Currency *</Label>
              <Input
                value={params.asset1Currency || "XRP"}
                onChange={(e) => updateParam("asset1Currency", e.target.value)}
                placeholder="XRP or currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 1 Issuer</Label>
              <Input
                value={params.asset1Issuer || ""}
                onChange={(e) => updateParam("asset1Issuer", e.target.value)}
                placeholder="rXXXXXXX... (for non-XRP)"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 2 Currency *</Label>
              <Input
                value={params.asset2Currency || ""}
                onChange={(e) => updateParam("asset2Currency", e.target.value)}
                placeholder="Currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Asset 2 Issuer *</Label>
              <Input
                value={params.asset2Issuer || ""}
                onChange={(e) => updateParam("asset2Issuer", e.target.value)}
                placeholder="rXXXXXXX..."
              />
            </div>
            <div className="space-y-2">
              <Label>Trading Fee *</Label>
              <Input
                type="number"
                value={params.tradingFee || ""}
                onChange={(e) => updateParam("tradingFee", e.target.value)}
                placeholder="0-1000 (0.001% units)"
              />
              <p className="text-xs text-muted-foreground">
                Fee in 1/100,000 units. 100 = 0.1%
              </p>
            </div>
          </>
        );

      // === ESCROW ===
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
                type="datetime-local"
                value={params.finishAfter || ""}
                onChange={(e) => updateParam("finishAfter", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cancel After (Date)</Label>
              <Input
                type="datetime-local"
                value={params.cancelAfter || ""}
                onChange={(e) => updateParam("cancelAfter", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Condition (Crypto-Condition)</Label>
              <Input
                value={params.condition || ""}
                onChange={(e) => updateParam("condition", e.target.value)}
                placeholder="Hex-encoded condition"
              />
            </div>
            <div className="space-y-2">
              <Label>Destination Tag</Label>
              <Input
                type="number"
                value={params.destinationTag || ""}
                onChange={(e) => updateParam("destinationTag", e.target.value)}
                placeholder="Optional tag"
              />
            </div>
          </>
        );

      case "EscrowFinish":
        return (
          <>
            <div className="space-y-2">
              <Label>Owner *</Label>
              <Input
                value={params.owner || ""}
                onChange={(e) => updateParam("owner", e.target.value)}
                placeholder="rXXXXXXX... (escrow creator)"
              />
            </div>
            <div className="space-y-2">
              <Label>Offer Sequence *</Label>
              <Input
                type="number"
                value={params.offerSequence || ""}
                onChange={(e) => updateParam("offerSequence", e.target.value)}
                placeholder="Sequence of EscrowCreate"
              />
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Input
                value={params.condition || ""}
                onChange={(e) => updateParam("condition", e.target.value)}
                placeholder="Hex-encoded condition"
              />
            </div>
            <div className="space-y-2">
              <Label>Fulfillment</Label>
              <Input
                value={params.fulfillment || ""}
                onChange={(e) => updateParam("fulfillment", e.target.value)}
                placeholder="Hex-encoded fulfillment"
              />
            </div>
          </>
        );

      case "EscrowCancel":
        return (
          <>
            <div className="space-y-2">
              <Label>Owner *</Label>
              <Input
                value={params.owner || ""}
                onChange={(e) => updateParam("owner", e.target.value)}
                placeholder="rXXXXXXX... (escrow creator)"
              />
            </div>
            <div className="space-y-2">
              <Label>Offer Sequence *</Label>
              <Input
                type="number"
                value={params.offerSequence || ""}
                onChange={(e) => updateParam("offerSequence", e.target.value)}
                placeholder="Sequence of EscrowCreate"
              />
            </div>
          </>
        );

      // === CHECKS ===
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
            <div className="space-y-2">
              <Label>Expiration (Date)</Label>
              <Input
                type="datetime-local"
                value={params.expiration || ""}
                onChange={(e) => updateParam("expiration", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Destination Tag</Label>
              <Input
                type="number"
                value={params.destinationTag || ""}
                onChange={(e) => updateParam("destinationTag", e.target.value)}
                placeholder="Optional tag"
              />
            </div>
            <div className="space-y-2">
              <Label>Invoice ID</Label>
              <Input
                value={params.invoiceId || ""}
                onChange={(e) => updateParam("invoiceId", e.target.value)}
                placeholder="256-bit hash (optional)"
              />
            </div>
          </>
        );

      case "CheckCash":
        return (
          <>
            <div className="space-y-2">
              <Label>Check ID *</Label>
              <Input
                value={params.checkId || ""}
                onChange={(e) => updateParam("checkId", e.target.value)}
                placeholder="Check object ID (64-char hex)"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (exact)</Label>
              <Input
                type="number"
                value={params.amount || ""}
                onChange={(e) => updateParam("amount", e.target.value)}
                placeholder="Exact amount to cash"
              />
            </div>
            <div className="space-y-2">
              <Label>Deliver Min</Label>
              <Input
                type="number"
                value={params.deliverMin || ""}
                onChange={(e) => updateParam("deliverMin", e.target.value)}
                placeholder="Minimum to receive"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Provide either Amount OR DeliverMin, not both
            </p>
          </>
        );

      case "CheckCancel":
        return (
          <div className="space-y-2">
            <Label>Check ID *</Label>
            <Input
              value={params.checkId || ""}
              onChange={(e) => updateParam("checkId", e.target.value)}
              placeholder="Check object ID (64-char hex)"
            />
          </div>
        );

      // === PAYMENT CHANNELS ===
      case "PaymentChannelCreate":
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
              <Label>Amount (XRP drops) *</Label>
              <Input
                type="number"
                value={params.amount || ""}
                onChange={(e) => updateParam("amount", e.target.value)}
                placeholder="1000000 (1 XRP)"
              />
            </div>
            <div className="space-y-2">
              <Label>Settle Delay (seconds) *</Label>
              <Input
                type="number"
                value={params.settleDelay || ""}
                onChange={(e) => updateParam("settleDelay", e.target.value)}
                placeholder="86400 (1 day)"
              />
            </div>
            <div className="space-y-2">
              <Label>Public Key *</Label>
              <Input
                value={params.publicKey || ""}
                onChange={(e) => updateParam("publicKey", e.target.value)}
                placeholder="Destination's public key (hex)"
              />
            </div>
            <div className="space-y-2">
              <Label>Cancel After (Date)</Label>
              <Input
                type="datetime-local"
                value={params.cancelAfter || ""}
                onChange={(e) => updateParam("cancelAfter", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Destination Tag</Label>
              <Input
                type="number"
                value={params.destinationTag || ""}
                onChange={(e) => updateParam("destinationTag", e.target.value)}
                placeholder="Optional tag"
              />
            </div>
          </>
        );

      case "PaymentChannelClaim":
        return (
          <>
            <div className="space-y-2">
              <Label>Channel ID *</Label>
              <Input
                value={params.channel || ""}
                onChange={(e) => updateParam("channel", e.target.value)}
                placeholder="Channel object ID (64-char hex)"
              />
            </div>
            <div className="space-y-2">
              <Label>Balance (drops)</Label>
              <Input
                type="number"
                value={params.balance || ""}
                onChange={(e) => updateParam("balance", e.target.value)}
                placeholder="Total claimed so far"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (drops)</Label>
              <Input
                type="number"
                value={params.amount || ""}
                onChange={(e) => updateParam("amount", e.target.value)}
                placeholder="Amount authorized by signature"
              />
            </div>
            <div className="space-y-2">
              <Label>Signature</Label>
              <Input
                value={params.signature || ""}
                onChange={(e) => updateParam("signature", e.target.value)}
                placeholder="Hex-encoded signature"
              />
            </div>
            <div className="space-y-2">
              <Label>Public Key</Label>
              <Input
                value={params.publicKey || ""}
                onChange={(e) => updateParam("publicKey", e.target.value)}
                placeholder="Public key that signed"
              />
            </div>
          </>
        );

      case "PaymentChannelFund":
        return (
          <>
            <div className="space-y-2">
              <Label>Channel ID *</Label>
              <Input
                value={params.channel || ""}
                onChange={(e) => updateParam("channel", e.target.value)}
                placeholder="Channel object ID (64-char hex)"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (XRP drops) *</Label>
              <Input
                type="number"
                value={params.amount || ""}
                onChange={(e) => updateParam("amount", e.target.value)}
                placeholder="Additional drops to add"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiration (Date)</Label>
              <Input
                type="datetime-local"
                value={params.expiration || ""}
                onChange={(e) => updateParam("expiration", e.target.value)}
              />
            </div>
          </>
        );

      // === NFTOKENS ===
      case "NFTokenMint":
        return (
          <>
            <div className="space-y-2">
              <Label>URI *</Label>
              <Input
                value={params.uri || ""}
                onChange={(e) => updateParam("uri", e.target.value)}
                placeholder="ipfs://... or https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>NFToken Taxon *</Label>
              <Input
                type="number"
                value={params.taxon || "0"}
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
                placeholder="500 = 0.5%"
                max={50000}
              />
            </div>
            <div className="space-y-2">
              <Label>Issuer</Label>
              <Input
                value={params.issuer || ""}
                onChange={(e) => updateParam("issuer", e.target.value)}
                placeholder="rXXXXXXX... (for authorized minting)"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={params.burnable || false}
                onCheckedChange={(v) => updateParam("burnable", v)}
              />
              <Label>Burnable by issuer</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={params.onlyXRP || false}
                onCheckedChange={(v) => updateParam("onlyXRP", v)}
              />
              <Label>Only sellable for XRP</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={params.transferable || true}
                onCheckedChange={(v) => updateParam("transferable", v)}
              />
              <Label>Transferable</Label>
            </div>
          </>
        );

      case "NFTokenBurn":
        return (
          <>
            <div className="space-y-2">
              <Label>NFToken ID *</Label>
              <Input
                value={params.nfTokenId || ""}
                onChange={(e) => updateParam("nfTokenId", e.target.value)}
                placeholder="64-character NFToken ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Input
                value={params.owner || ""}
                onChange={(e) => updateParam("owner", e.target.value)}
                placeholder="rXXXXXXX... (if issuer burning)"
              />
            </div>
          </>
        );

      case "NFTokenCreateOffer":
        return (
          <>
            <div className="space-y-2">
              <Label>NFToken ID *</Label>
              <Input
                value={params.nfTokenId || ""}
                onChange={(e) => updateParam("nfTokenId", e.target.value)}
                placeholder="64-character NFToken ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                value={params.amount || ""}
                onChange={(e) => updateParam("amount", e.target.value)}
                placeholder="Price in drops or currency"
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                value={params.currency || "XRP"}
                onChange={(e) => updateParam("currency", e.target.value)}
                placeholder="XRP or currency code"
              />
            </div>
            <div className="space-y-2">
              <Label>Owner (for buy offers)</Label>
              <Input
                value={params.owner || ""}
                onChange={(e) => updateParam("owner", e.target.value)}
                placeholder="rXXXXXXX... (NFT owner)"
              />
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input
                value={params.destination || ""}
                onChange={(e) => updateParam("destination", e.target.value)}
                placeholder="rXXXXXXX... (only this can accept)"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiration (Date)</Label>
              <Input
                type="datetime-local"
                value={params.expiration || ""}
                onChange={(e) => updateParam("expiration", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={params.isSellOffer || false}
                onCheckedChange={(v) => updateParam("isSellOffer", v)}
              />
              <Label>Sell Offer (vs Buy Offer)</Label>
            </div>
          </>
        );

      case "NFTokenAcceptOffer":
        return (
          <>
            <div className="space-y-2">
              <Label>NFToken Sell Offer</Label>
              <Input
                value={params.nfTokenSellOffer || ""}
                onChange={(e) => updateParam("nfTokenSellOffer", e.target.value)}
                placeholder="Sell offer ID (64-char hex)"
              />
            </div>
            <div className="space-y-2">
              <Label>NFToken Buy Offer</Label>
              <Input
                value={params.nfTokenBuyOffer || ""}
                onChange={(e) => updateParam("nfTokenBuyOffer", e.target.value)}
                placeholder="Buy offer ID (64-char hex)"
              />
            </div>
            <div className="space-y-2">
              <Label>NFToken Broker Fee</Label>
              <Input
                type="number"
                value={params.nfTokenBrokerFee || ""}
                onChange={(e) => updateParam("nfTokenBrokerFee", e.target.value)}
                placeholder="Broker fee (for brokered mode)"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Provide sell offer, buy offer, or both (brokered mode)
            </p>
          </>
        );

      case "NFTokenCancelOffer":
        return (
          <>
            <div className="space-y-2">
              <Label>NFToken Offers (JSON array) *</Label>
              <Textarea
                value={params.nfTokenOffers || ""}
                onChange={(e) => updateParam("nfTokenOffers", e.target.value)}
                placeholder='["offer_id_1", "offer_id_2"]'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Array of offer IDs to cancel (up to 500)
              </p>
            </div>
          </>
        );

      // === TICKETS ===
      case "TicketCreate":
        return (
          <div className="space-y-2">
            <Label>Ticket Count *</Label>
            <Input
              type="number"
              value={params.ticketCount || ""}
              onChange={(e) => updateParam("ticketCount", e.target.value)}
              placeholder="1-250"
              min={1}
              max={250}
            />
            <p className="text-xs text-muted-foreground">
              Number of tickets to create (1-250 per transaction)
            </p>
          </div>
        );

      // === CUSTOM ===
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
              <Textarea
                value={params.args || ""}
                onChange={(e) => updateParam("args", e.target.value)}
                placeholder='{"param1": "value1"}'
                rows={3}
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
