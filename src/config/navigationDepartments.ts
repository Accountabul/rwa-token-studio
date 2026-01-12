import { EntityType, ActionType } from "@/permissions";
import { LucideIcon, Coins, Banknote, Shield, CheckCircle, Wrench, BarChart3, BookOpen } from "lucide-react";

/**
 * Navigation Department Configuration
 * Implements "Department (Why) → Workflow (What) → Tool (How)" mental model
 */

export interface NavItem {
  label: string;
  href: string;
  entity: EntityType;
  action: ActionType;
}

export interface NavDepartment {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  items: NavItem[];
}

/**
 * Department-based navigation structure
 * Each department groups related workflows and tools
 */
export const NAV_DEPARTMENTS: NavDepartment[] = [
  {
    id: "asset-token-ops",
    label: "Asset & Token Operations",
    icon: Coins,
    description: "Core issuance & lifecycle",
    items: [
      { label: "Tokenization Projects", href: "/", entity: "PROJECT", action: "VIEW_LIST" },
      { label: "Token Registry", href: "/tokens", entity: "TOKEN", action: "VIEW_LIST" },
      { label: "Smart Contracts", href: "/contracts", entity: "CONTRACT", action: "VIEW_LIST" },
      { label: "Batch Transactions", href: "/batch", entity: "BATCH_TRANSACTION", action: "VIEW_LIST" },
    ]
  },
  {
    id: "payments-liquidity",
    label: "Payments & Liquidity",
    icon: Banknote,
    description: "Money movement & settlement",
    items: [
      { label: "Escrows", href: "/escrows", entity: "ESCROW", action: "VIEW_LIST" },
      { label: "Payment Channels", href: "/channels", entity: "PAYMENT_CHANNEL", action: "VIEW_LIST" },
      { label: "AMM Pools", href: "/amm", entity: "AMM_POOL", action: "VIEW_LIST" },
    ]
  },
  {
    id: "custody-wallets",
    label: "Custody & Wallets",
    icon: Shield,
    description: "Keys, control, safety",
    items: [
      { label: "Wallet Management", href: "/wallets", entity: "WALLET", action: "VIEW_LIST" },
      // Future: Signing Requests, Freezes & Clawbacks
    ]
  },
  {
    id: "compliance-verification",
    label: "Compliance & Verification",
    icon: CheckCircle,
    description: "Checks before anything moves",
    items: [
      { label: "Checks", href: "/checks", entity: "CHECK", action: "VIEW_LIST" },
      { label: "Investor Onboarding", href: "/investors", entity: "INVESTOR", action: "VIEW_LIST" },
      // Future: KYC/AML Status, Exceptions & Holds
    ]
  },
  {
    id: "operations-work-orders",
    label: "Operations & Work Orders",
    icon: Wrench,
    description: "Site work, inspections, maintenance",
    items: [
      // Future: Create Work Order, Active/Completed, Vendors, SLA
      // This department will be hidden until work order items exist
    ]
  },
  {
    id: "reporting-oversight",
    label: "Reporting & Oversight",
    icon: BarChart3,
    description: "Read-only, audit-first",
    items: [
      { label: "Reporting & Logs", href: "/reports", entity: "REPORT", action: "VIEW" },
      // Future: Audit Trails, Financial Reports, Export Center
    ]
  },
  {
    id: "knowledge-support",
    label: "Knowledge & Support",
    icon: BookOpen,
    description: "SOPs, help, system status",
    items: [
      { label: "Knowledge Base", href: "/knowledge-base", entity: "KNOWLEDGE_BASE", action: "VIEW_LIST" },
      // Future: SOPs, Help/Support, System Status
    ]
  }
];

/**
 * Get department label for a given route
 * Used by Breadcrumbs component
 */
export function getDepartmentForRoute(pathname: string): NavDepartment | null {
  for (const dept of NAV_DEPARTMENTS) {
    const matchingItem = dept.items.find(item => {
      if (item.href === "/") return pathname === "/";
      return pathname.startsWith(item.href);
    });
    if (matchingItem) return dept;
  }
  return null;
}

/**
 * Get nav item for a given route
 */
export function getNavItemForRoute(pathname: string): NavItem | null {
  for (const dept of NAV_DEPARTMENTS) {
    const matchingItem = dept.items.find(item => {
      if (item.href === "/") return pathname === "/";
      return pathname.startsWith(item.href);
    });
    if (matchingItem) return matchingItem;
  }
  return null;
}
