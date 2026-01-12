import React from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "./Breadcrumbs";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showBreadcrumbs?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  showBreadcrumbs = true,
}) => {
  return (
    <header className="sticky top-0 z-10 bg-background border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          {showBreadcrumbs && <Breadcrumbs />}
        </div>
        
        <div className="flex items-center gap-3">
          {actions}
          <NotificationBell />
        </div>
      </div>
      
      {(title || subtitle) && (
        <div className="px-6 pb-4">
          {title && <h1 className="text-2xl font-semibold">{title}</h1>}
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      )}
    </header>
  );
};
