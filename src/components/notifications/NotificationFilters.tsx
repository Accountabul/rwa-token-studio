import React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  NotificationFilters as Filters,
  NotificationStatus,
  NotificationPriority,
} from "@/types/notifications";

interface NotificationFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const STATUS_OPTIONS: Array<{ value: NotificationStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

const PRIORITY_OPTIONS: Array<{ value: NotificationPriority | "all"; label: string }> = [
  { value: "all", label: "All Priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

const ENTITY_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "user", label: "Users" },
  { value: "token_project", label: "Token Projects" },
  { value: "token", label: "Tokens" },
  { value: "escrow", label: "Escrows" },
  { value: "work_order", label: "Work Orders" },
  { value: "approval", label: "Approvals" },
  { value: "kyc", label: "KYC" },
  { value: "payout", label: "Payouts" },
];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const activeFilterCount = [
    filters.status && filters.status !== "all",
    filters.priority && filters.priority !== "all",
    filters.entityType && filters.entityType !== "all",
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    onFiltersChange({
      status: "all",
      priority: "all",
      entityType: "all",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5">
            {activeFilterCount}
          </Badge>
        )}
      </div>

      <Select
        value={filters.status || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value as NotificationStatus | "all" })
        }
      >
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, priority: value as NotificationPriority | "all" })
        }
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.entityType || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, entityType: value })
        }
      >
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="Entity Type" />
        </SelectTrigger>
        <SelectContent>
          {ENTITY_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1"
          onClick={handleClearFilters}
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
};
