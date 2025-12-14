import React from "react";
import { cn } from "@/lib/utils";
import {
  KycStatus,
  AccreditationStatus,
  PermissionDexStatus,
  ApplicationStatus,
  ApprovalLevel,
  kycStatusLabel,
  accreditationLabel,
  permissionDexLabel,
  applicationStatusLabel,
  approvalLevelLabel,
} from "@/types/investor";
import { CheckCircle2, Clock, XCircle, MinusCircle } from "lucide-react";

interface BadgeProps {
  className?: string;
}

export const KycStatusBadge: React.FC<BadgeProps & { status: KycStatus }> = ({
  status,
  className,
}) => {
  const styles: Record<KycStatus, string> = {
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        styles[status],
        className
      )}
    >
      {kycStatusLabel[status]}
    </span>
  );
};

export const AccreditationBadge: React.FC<
  BadgeProps & { status: AccreditationStatus }
> = ({ status, className }) => {
  const styles: Record<AccreditationStatus, string> = {
    ACCREDITED: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    NON_ACCREDITED: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    N_A: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        styles[status],
        className
      )}
    >
      {accreditationLabel[status]}
    </span>
  );
};

export const PermissionDexBadge: React.FC<
  BadgeProps & { status: PermissionDexStatus }
> = ({ status, className }) => {
  const styles: Record<PermissionDexStatus, string> = {
    NOT_LINKED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        styles[status],
        className
      )}
    >
      {permissionDexLabel[status]}
    </span>
  );
};

export const ApplicationStatusBadge: React.FC<
  BadgeProps & { status: ApplicationStatus }
> = ({ status, className }) => {
  const styles: Record<ApplicationStatus, string> = {
    APPLIED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    KYC_REQUIRED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    KYC_APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    PD_REQUIRED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    READY_FOR_FUNDING: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    FUNDED: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    TOKENS_ISSUED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse-subtle",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        styles[status],
        className
      )}
    >
      {applicationStatusLabel[status]}
    </span>
  );
};

// Approval Level Badge
const approvalStyles: Record<ApprovalLevel, string> = {
  FULLY_APPROVED: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  PARTIALLY_APPROVED: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  NOT_APPROVED: "bg-red-500/10 text-red-700 border-red-500/20",
};

export const ApprovalLevelBadge: React.FC<BadgeProps & { level: ApprovalLevel }> = ({
  level,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
      approvalStyles[level],
      className
    )}
  >
    {approvalLevelLabel[level]}
  </span>
);

// Approval Level Icon (for table name column)
export const ApprovalLevelIcon: React.FC<{ level: ApprovalLevel; className?: string }> = ({
  level,
  className,
}) => {
  switch (level) {
    case "FULLY_APPROVED":
      return <CheckCircle2 className={cn("w-4 h-4 text-emerald-500", className)} />;
    case "PARTIALLY_APPROVED":
      return <Clock className={cn("w-4 h-4 text-amber-500", className)} />;
    case "NOT_APPROVED":
      return <XCircle className={cn("w-4 h-4 text-red-500", className)} />;
  }
};

// Compact status icons for table cells
export const KycStatusIcon: React.FC<{ status: KycStatus }> = ({ status }) => {
  switch (status) {
    case "APPROVED":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "PENDING":
      return <Clock className="w-4 h-4 text-amber-500" />;
    case "REJECTED":
      return <XCircle className="w-4 h-4 text-red-500" />;
  }
};

export const PermissionDexIcon: React.FC<{ hasApproved: boolean; hasPending: boolean }> = ({
  hasApproved,
  hasPending,
}) => {
  if (hasApproved) {
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  }
  if (hasPending) {
    return <Clock className="w-4 h-4 text-amber-500" />;
  }
  return <MinusCircle className="w-4 h-4 text-muted-foreground" />;
};
