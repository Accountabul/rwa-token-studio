import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AuthorizedHolder } from "@/types/mptTransactions";
import { Role } from "@/types/tokenization";
import { Lock, Unlock, Globe, User, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LockControlsProps {
  projectId: string;
  role: Role;
  canLock: boolean;
  isGloballyLocked: boolean;
  authorizedHolders: AuthorizedHolder[];
  lockedHolders: string[];
  onGlobalLockToggle: (locked: boolean) => void;
  onIndividualLockToggle: (address: string, locked: boolean) => void;
}

const canManageLocks = (role: Role): boolean => {
  return role === "SUPER_ADMIN" || role === "COMPLIANCE_OFFICER";
};

export const LockControls: React.FC<LockControlsProps> = ({
  role,
  canLock,
  isGloballyLocked,
  authorizedHolders,
  lockedHolders,
  onGlobalLockToggle,
  onIndividualLockToggle,
}) => {
  const [pendingGlobalLock, setPendingGlobalLock] = useState<boolean | null>(null);

  const activeHolders = authorizedHolders.filter((h) => h.status === "AUTHORIZED");

  const handleGlobalLockConfirm = () => {
    if (pendingGlobalLock !== null) {
      onGlobalLockToggle(pendingGlobalLock);
      toast.success(pendingGlobalLock ? "Token globally locked" : "Token globally unlocked", {
        description: pendingGlobalLock
          ? "All token transfers are now frozen"
          : "Token transfers are now enabled",
      });
      setPendingGlobalLock(null);
    }
  };

  const handleIndividualToggle = (address: string, currentlyLocked: boolean) => {
    onIndividualLockToggle(address, !currentlyLocked);
    toast.success(!currentlyLocked ? "Holder locked" : "Holder unlocked", {
      description: `${address.slice(0, 8)}... is now ${!currentlyLocked ? "frozen" : "active"}`,
    });
  };

  if (!canLock) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h4 className="text-sm font-medium text-foreground mb-2">
          Locking Disabled
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm">
          This token was created without the Lock flag enabled. Token freezing is not possible.
        </p>
      </div>
    );
  }

  if (!canManageLocks(role)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">
          Only Compliance Officers and Super Admins can manage locks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Lock Control */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isGloballyLocked ? "bg-destructive/10" : "bg-primary/10"
            }`}>
              {isGloballyLocked ? (
                <Lock className="w-5 h-5 text-destructive" />
              ) : (
                <Globe className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Global Lock</h4>
              <p className="text-xs text-muted-foreground">
                {isGloballyLocked
                  ? "All transfers are currently frozen"
                  : "Transfers are currently enabled"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={isGloballyLocked ? "destructive" : "outline"}>
              {isGloballyLocked ? "LOCKED" : "ACTIVE"}
            </Badge>

            <AlertDialog open={pendingGlobalLock !== null}>
              <AlertDialogTrigger asChild>
                <Switch
                  checked={isGloballyLocked}
                  onCheckedChange={(checked) => setPendingGlobalLock(checked)}
                />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {pendingGlobalLock ? "Enable Global Lock?" : "Disable Global Lock?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {pendingGlobalLock
                      ? "This will freeze ALL token transfers. No holder will be able to send or receive tokens until the lock is removed."
                      : "This will re-enable token transfers for all holders (except those with individual locks)."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPendingGlobalLock(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleGlobalLockConfirm}
                    className={pendingGlobalLock ? "bg-destructive hover:bg-destructive/90" : ""}
                  >
                    {pendingGlobalLock ? "Lock All" : "Unlock All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Individual Holder Locks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-foreground">
            Individual Holder Locks
          </h4>
          <span className="text-[10px] text-muted-foreground">
            {lockedHolders.length} of {activeHolders.length} locked
          </span>
        </div>

        {activeHolders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-xs text-muted-foreground">
              No authorized holders to manage
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeHolders.map((holder) => {
              const isLocked = lockedHolders.includes(holder.address);
              return (
                <div
                  key={holder.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isLocked
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isLocked ? "bg-destructive/10" : "bg-muted"
                    }`}>
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-destructive" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <code className="text-xs font-mono text-foreground">
                        {holder.address.slice(0, 12)}...{holder.address.slice(-8)}
                      </code>
                      {isLocked && (
                        <p className="text-[10px] text-destructive mt-0.5">
                          Transfers frozen for this holder
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={isLocked ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => handleIndividualToggle(holder.address, isLocked)}
                    disabled={isGloballyLocked}
                  >
                    {isLocked ? (
                      <>
                        <Unlock className="w-4 h-4 mr-1" />
                        Unlock
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-1" />
                        Lock
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {isGloballyLocked && activeHolders.length > 0 && (
          <p className="text-[10px] text-amber-600 bg-amber-500/10 p-2 rounded-lg">
            Individual locks are disabled while global lock is active
          </p>
        )}
      </div>
    </div>
  );
};
