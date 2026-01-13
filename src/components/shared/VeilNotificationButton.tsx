import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import veilLogo from "@/assets/veil-logo.jpg";

export const VeilNotificationButton: React.FC = () => {
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const handleClick = () => {
    navigate("/admin/notifications");
  };

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative w-9 h-9 rounded-full overflow-hidden",
        "ring-2 ring-primary/30 hover:ring-primary/50",
        "transition-all duration-200 hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-primary"
      )}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      {/* Veil Logo */}
      <img
        src={veilLogo}
        alt="Veil"
        className="w-full h-full object-cover"
      />
      
      {/* Notification Badge */}
      {unreadCount > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1 flex items-center justify-center",
            "min-w-[18px] h-[18px] px-1 rounded-full",
            "bg-destructive text-destructive-foreground",
            "text-[10px] font-bold",
            "animate-pulse"
          )}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
};
