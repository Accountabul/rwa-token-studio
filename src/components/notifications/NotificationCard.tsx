import React from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  FolderPlus,
  RefreshCw,
  Coins,
  Layers,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  DollarSign,
  ClipboardList,
  AlertCircle,
  Clock,
  Timer,
  Bell,
  Archive,
} from "lucide-react";
import { Notification, EVENT_TYPE_META, PRIORITY_COLORS } from "@/types/notifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMarkNotificationsRead, useArchiveNotification } from "@/hooks/useNotifications";

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  FolderPlus,
  RefreshCw,
  Coins,
  Layers,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  DollarSign,
  ClipboardList,
  AlertCircle,
  Clock,
  Timer,
};

interface NotificationCardProps {
  notification: Notification;
  compact?: boolean;
  onNavigate?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  compact = false,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const markAsRead = useMarkNotificationsRead();
  const archiveNotification = useArchiveNotification();

  const meta = EVENT_TYPE_META[notification.event_type];
  const IconComponent = meta?.icon ? ICON_MAP[meta.icon] : Bell;
  const isUnread = notification.status === "unread";

  const handleClick = () => {
    // Mark as read if unread
    if (isUnread) {
      markAsRead.mutate([notification.id]);
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      navigate(notification.action_url);
      onNavigate?.();
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    archiveNotification.mutate(notification.id);
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
          isUnread && "bg-primary/5"
        )}
        onClick={handleClick}
      >
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm leading-snug", isUnread && "font-medium")}>
            {notification.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            {notification.priority === "high" || notification.priority === "critical" ? (
              <span className={cn("text-xs font-medium", PRIORITY_COLORS[notification.priority])}>
                {notification.priority}
              </span>
            ) : null}
          </div>
        </div>
        {isUnread && (
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
        isUnread && "bg-primary/5 border-primary/20"
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={cn("text-sm leading-snug", isUnread && "font-medium")}>
              {notification.title}
            </p>
            {notification.summary && (
              <p className="text-sm text-muted-foreground mt-1">
                {notification.summary}
              </p>
            )}
          </div>
          {isUnread && (
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {notification.actor_name}
            </span>
            {(notification.priority === "high" || notification.priority === "critical") && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className={cn("text-xs font-medium uppercase", PRIORITY_COLORS[notification.priority])}>
                  {notification.priority}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            {notification.action_url && (
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleArchive}
            >
              <Archive className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
