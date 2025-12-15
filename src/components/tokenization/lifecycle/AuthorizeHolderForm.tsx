import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AuthorizedHolder } from "@/types/mptTransactions";
import { Role } from "@/types/tokenization";
import { UserPlus, UserMinus, Shield, Clock } from "lucide-react";
import { toast } from "sonner";

interface AuthorizeHolderFormProps {
  projectId: string;
  role: Role;
  holders: AuthorizedHolder[];
  onAuthorize: (address: string) => void;
  onRevoke: (holderId: string) => void;
}

const canAuthorize = (role: Role): boolean => {
  return role === "SUPER_ADMIN" || role === "CUSTODY_OFFICER";
};

export const AuthorizeHolderForm: React.FC<AuthorizeHolderFormProps> = ({
  role,
  holders,
  onAuthorize,
  onRevoke,
}) => {
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Please enter a valid XRPL address");
      return;
    }
    if (!address.startsWith("r") || address.length < 25) {
      toast.error("Invalid XRPL address format");
      return;
    }

    setIsSubmitting(true);
    try {
      onAuthorize(address.trim());
      setAddress("");
      toast.success("Holder authorized successfully", {
        description: `Address ${address.slice(0, 8)}...${address.slice(-6)} can now receive tokens`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = (holder: AuthorizedHolder) => {
    onRevoke(holder.id);
    toast.success("Authorization revoked", {
      description: `${holder.address.slice(0, 8)}...${holder.address.slice(-6)} can no longer receive tokens`,
    });
  };

  const activeHolders = holders.filter((h) => h.status === "AUTHORIZED");
  const revokedHolders = holders.filter((h) => h.status === "REVOKED");

  if (!canAuthorize(role)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">
          Only Custody Officers and Super Admins can authorize holders
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Holder */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address" className="text-xs font-medium">
            Authorize New Holder
          </Label>
          <div className="flex gap-2">
            <Input
              id="address"
              placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono text-xs"
            />
            <Button type="submit" disabled={isSubmitting || !address.trim()}>
              <UserPlus className="w-4 h-4 mr-2" />
              Authorize
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Enter the XRPL address of the account you want to authorize to hold tokens
          </p>
        </div>
      </form>

      {/* Active Holders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-foreground">
            Authorized Holders ({activeHolders.length})
          </h4>
        </div>
        {activeHolders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-xs text-muted-foreground">
              No holders authorized yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeHolders.map((holder) => (
              <div
                key={holder.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <code className="text-xs font-mono text-foreground">
                      {holder.address.slice(0, 12)}...{holder.address.slice(-8)}
                    </code>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        Authorized {holder.authorizedAt}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(holder)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revoked Holders */}
      {revokedHolders.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Revoked ({revokedHolders.length})
          </h4>
          <div className="space-y-2">
            {revokedHolders.map((holder) => (
              <div
                key={holder.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <code className="text-xs font-mono text-muted-foreground">
                    {holder.address.slice(0, 12)}...{holder.address.slice(-8)}
                  </code>
                  <Badge variant="outline" className="text-[10px]">
                    Revoked
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
