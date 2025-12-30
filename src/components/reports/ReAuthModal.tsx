import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, AlertTriangle } from "lucide-react";

interface ReAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  reason?: string;
  requirePassword?: boolean;
  require2FA?: boolean;
}

export const ReAuthModal: React.FC<ReAuthModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  reason = "This action requires identity confirmation",
  requirePassword = true,
  require2FA = false,
}) => {
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (requirePassword && !password) {
      setError("Password is required");
      return;
    }

    if (require2FA && !twoFactorCode) {
      setError("2FA code is required");
      return;
    }

    setIsLoading(true);

    // Simulate password verification (in real impl, would call auth service)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // For demo purposes, accept any non-empty password
    if (requirePassword && password.length < 1) {
      setError("Invalid password");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setPassword("");
    setTwoFactorCode("");
    onConfirm();
    onOpenChange(false);
  };

  const handleClose = () => {
    setPassword("");
    setTwoFactorCode("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Identity Confirmation
          </DialogTitle>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Security Notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700">
                <p>
                  For security purposes, please confirm your identity before
                  proceeding with this action.
                </p>
              </div>
            </div>

            {/* Password Field */}
            {requirePassword && (
              <div className="space-y-2">
                <Label htmlFor="reauth-password" className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  Password
                </Label>
                <Input
                  id="reauth-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                />
              </div>
            )}

            {/* 2FA Field */}
            {require2FA && (
              <div className="space-y-2">
                <Label htmlFor="reauth-2fa">2FA Code</Label>
                <Input
                  id="reauth-2fa"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) =>
                    setTwoFactorCode(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Confirm Identity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
