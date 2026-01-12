import React from "react";
import { Role, roleLabel } from "@/types/tokenization";
import { SENSITIVE_ROLES, DEFAULT_ROLE_EXPIRATION_DAYS } from "@/types/userManagement";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Clock, FileText } from "lucide-react";

interface SensitiveRoleWarningProps {
  role: Role;
  showExpiration?: boolean;
}

export const SensitiveRoleWarning: React.FC<SensitiveRoleWarningProps> = ({
  role,
  showExpiration = true,
}) => {
  if (!SENSITIVE_ROLES.includes(role)) {
    return null;
  }

  const expirationDays = DEFAULT_ROLE_EXPIRATION_DAYS[role];
  
  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Sensitive Role Assignment</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          <strong>{roleLabel[role]}</strong> is a sensitive role that grants access to 
          dangerous permissions including the ability to sign transactions, 
          freeze assets, or manage user access.
        </p>
        
        <div className="flex flex-col gap-1 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Justification is required for this assignment</span>
          </div>
          
          {showExpiration && expirationDays && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Default expiration: <strong>{expirationDays} days</strong>
              </span>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export const isSensitiveRole = (role: Role): boolean => {
  return SENSITIVE_ROLES.includes(role);
};
