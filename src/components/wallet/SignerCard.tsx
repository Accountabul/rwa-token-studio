import React from "react";
import { format } from "date-fns";
import { User, Trash2, ExternalLink } from "lucide-react";
import { MultiSignSigner } from "@/types/multiSign";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExplorerLinkBadge } from "@/components/tokens/ExplorerLinkBadge";

interface SignerCardProps {
  signer: MultiSignSigner;
  canRemove: boolean;
  onRemove: () => void;
}

export const SignerCard: React.FC<SignerCardProps> = ({ signer, canRemove, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full bg-muted">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{signer.name}</span>
            <Badge variant="secondary" className="text-xs">
              Weight: {signer.weight}
            </Badge>
            {signer.role && (
              <Badge variant="outline" className="text-xs">
                {signer.role}
              </Badge>
            )}
          </div>
          <ExplorerLinkBadge
            type="address"
            value={signer.address}
            network="testnet"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Added {format(new Date(signer.addedAt), "MMM d, yyyy")}
          </p>
        </div>
      </div>
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
