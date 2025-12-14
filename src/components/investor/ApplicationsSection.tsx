import React from "react";
import {
  Investor,
  InvestorWallet,
  InvestorApplication,
  canParticipate,
  getBlockedReason,
} from "@/types/investor";
import {
  ApplicationStatusBadge,
  PermissionDexBadge,
} from "./InvestorStatusBadges";
import { FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ApplicationsSectionProps {
  investor: Investor;
  applications: InvestorApplication[];
  wallets: InvestorWallet[];
}

export const ApplicationsSection: React.FC<ApplicationsSectionProps> = ({
  investor,
  applications,
  wallets,
}) => {
  const getWallet = (walletId: string) =>
    wallets.find((w) => w.id === walletId);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">
            Project Applications
          </h4>
        </div>
        <span className="text-xs text-muted-foreground">
          {applications.length} application{applications.length !== 1 && "s"}
        </span>
      </div>

      {applications.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No applications submitted by this investor.
        </p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const wallet = getWallet(app.walletId);
            const isEligible = wallet
              ? canParticipate(investor, wallet)
              : false;
            const blockedReason = wallet
              ? getBlockedReason(investor, wallet)
              : "Wallet not found";

            return (
              <div
                key={app.id}
                className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-foreground">
                      {app.projectName}
                    </h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Requested</span>
                    <p className="font-medium text-foreground">
                      ${app.requestedAllocation.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Approved</span>
                    <p className="font-medium text-foreground">
                      {app.approvedAllocation
                        ? `$${app.approvedAllocation.toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {wallet && (
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Wallet Used
                        </span>
                        <code className="block text-xs font-mono text-foreground mt-0.5">
                          {wallet.xrplAddress.slice(0, 12)}...
                          {wallet.xrplAddress.slice(-8)}
                        </code>
                      </div>
                      <PermissionDexBadge status={wallet.permissionDexStatus} />
                    </div>
                  </div>
                )}

                {/* Eligibility Status */}
                <div
                  className={`flex items-start gap-2 p-2.5 rounded-md text-xs ${
                    isEligible
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  {isEligible ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-emerald-700">
                        Eligible for funding and token issuance
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span className="text-red-700">
                        Blocked: {blockedReason}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
