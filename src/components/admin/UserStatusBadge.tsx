import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  UserStatus, 
  userStatusLabel, 
  userStatusColor 
} from "@/types/userManagement";
import { 
  Mail, 
  CheckCircle, 
  Pause, 
  XCircle, 
  Lock 
} from "lucide-react";

interface UserStatusBadgeProps {
  status: UserStatus;
  showIcon?: boolean;
  className?: string;
}

const statusIcon: Record<UserStatus, React.ReactNode> = {
  INVITED: <Mail className="w-3 h-3" />,
  ACTIVE: <CheckCircle className="w-3 h-3" />,
  SUSPENDED: <Pause className="w-3 h-3" />,
  TERMINATED: <XCircle className="w-3 h-3" />,
  LOCKED: <Lock className="w-3 h-3" />,
};

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  status,
  showIcon = true,
  className,
}) => {
  return (
    <Badge 
      variant="outline" 
      className={`${userStatusColor[status]} border-0 ${className}`}
    >
      {showIcon && <span className="mr-1">{statusIcon[status]}</span>}
      {userStatusLabel[status]}
    </Badge>
  );
};
