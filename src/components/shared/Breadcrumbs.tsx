import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { getDepartmentForRoute, getNavItemForRoute } from "@/config/navigationDepartments";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  /** Optional custom page title (overrides auto-detected) */
  pageTitle?: string;
  /** Optional detail item (e.g., "Token XYZ") */
  detailLabel?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ pageTitle, detailLabel }) => {
  const location = useLocation();
  const pathname = location.pathname;

  // Get department and nav item for current route
  const department = getDepartmentForRoute(pathname);
  const navItem = getNavItemForRoute(pathname);

  // Build breadcrumb segments
  const segments: { label: string; href?: string }[] = [];

  // Add department (if found)
  if (department) {
    segments.push({
      label: department.label,
      // Department itself isn't clickable - it's a category
    });
  }

  // Add page (if found)
  if (navItem) {
    const isDetailPage = pathname !== navItem.href && pathname.startsWith(navItem.href);
    segments.push({
      label: pageTitle || navItem.label,
      href: isDetailPage ? navItem.href : undefined, // Only link if we're on a detail page
    });
  }

  // Add detail item (if provided)
  if (detailLabel) {
    segments.push({
      label: detailLabel,
    });
  }

  // Handle admin routes specially
  if (pathname.startsWith("/admin")) {
    return (
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <span className="text-amber-500 font-medium">Administration</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
        <span className="text-foreground font-medium">
          {pageTitle || "User Management"}
        </span>
      </nav>
    );
  }

  // If no segments, don't render
  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          )}
          {segment.href ? (
            <Link
              to={segment.href}
              className="hover:text-foreground transition-colors"
            >
              {segment.label}
            </Link>
          ) : (
            <span
              className={cn(
                index === segments.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {segment.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
