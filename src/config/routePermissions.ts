import { EntityType, ActionType } from "@/permissions";

/**
 * Route permission configuration
 * Maps routes to required entity/action permissions
 */
export interface RoutePermission {
  entity: EntityType;
  action: ActionType;
  label?: string;
}

/**
 * Route-to-permission mapping
 * Used by ProtectedRoute to check access
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  "/": { entity: "PROJECT", action: "VIEW_LIST", label: "Tokenization Projects" },
  "/tokens": { entity: "TOKEN", action: "VIEW_LIST", label: "Token Registry" },
  "/tokens/create": { entity: "TOKEN", action: "CREATE", label: "Create Token" },
  "/escrows": { entity: "ESCROW", action: "VIEW_LIST", label: "Escrows" },
  "/escrows/:escrowId": { entity: "ESCROW", action: "VIEW", label: "Escrow Details" },
  "/wallets": { entity: "WALLET", action: "VIEW_LIST", label: "Wallet Management" },
  "/investors": { entity: "INVESTOR", action: "VIEW_LIST", label: "Investor Onboarding" },
  "/investors/:investorId": { entity: "INVESTOR", action: "VIEW", label: "Investor Profile" },
  "/checks": { entity: "CHECK", action: "VIEW_LIST", label: "Checks" },
  "/checks/:checkId": { entity: "CHECK", action: "VIEW", label: "Check Details" },
  "/channels": { entity: "PAYMENT_CHANNEL", action: "VIEW_LIST", label: "Payment Channels" },
  "/channels/:channelId": { entity: "PAYMENT_CHANNEL", action: "VIEW", label: "Channel Details" },
  "/amm": { entity: "AMM_POOL", action: "VIEW_LIST", label: "AMM Pools" },
  "/amm/:poolId": { entity: "AMM_POOL", action: "VIEW", label: "Pool Details" },
  "/contracts": { entity: "CONTRACT", action: "VIEW_LIST", label: "Smart Contracts" },
  "/contracts/:contractId": { entity: "CONTRACT", action: "VIEW", label: "Contract Details" },
  "/batch": { entity: "BATCH_TRANSACTION", action: "VIEW_LIST", label: "Batch Transactions" },
  "/batch/new": { entity: "BATCH_TRANSACTION", action: "CREATE", label: "Create Batch" },
  "/batch/:batchId": { entity: "BATCH_TRANSACTION", action: "VIEW", label: "Batch Details" },
  "/knowledge-base": { entity: "KNOWLEDGE_BASE", action: "VIEW_LIST", label: "Knowledge Base" },
  "/reports": { entity: "REPORT", action: "VIEW", label: "Reports & Logs" },
  // Admin routes
  "/admin/users": { entity: "USER_ROLE", action: "VIEW_LIST", label: "User Management" },
};

/**
 * Find matching route permission for a given path
 * Handles dynamic routes like /escrows/:escrowId
 */
export function getRoutePermission(pathname: string): RoutePermission | null {
  // Exact match first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Check for dynamic routes
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (route.includes(":")) {
      // Convert route pattern to regex
      const pattern = route.replace(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(pathname)) {
        return permission;
      }
    }
  }

  return null;
}

/**
 * Navigation items with permission metadata
 * Used by AppSidebar to filter visible routes
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string; // Icon name - component will resolve
  entity: EntityType;
  action: ActionType;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Tokenization Projects", href: "/", icon: "LayoutDashboard", entity: "PROJECT", action: "VIEW_LIST" },
  { label: "Token Registry", href: "/tokens", icon: "Coins", entity: "TOKEN", action: "VIEW_LIST" },
  { label: "Escrows", href: "/escrows", icon: "Lock", entity: "ESCROW", action: "VIEW_LIST" },
  { label: "Wallet Management", href: "/wallets", icon: "Wallet", entity: "WALLET", action: "VIEW_LIST" },
  { label: "Checks", href: "/checks", icon: "FileCheck", entity: "CHECK", action: "VIEW_LIST" },
  { label: "Payment Channels", href: "/channels", icon: "ArrowLeftRight", entity: "PAYMENT_CHANNEL", action: "VIEW_LIST" },
  { label: "AMM Pools", href: "/amm", icon: "Waves", entity: "AMM_POOL", action: "VIEW_LIST" },
  { label: "Smart Contracts", href: "/contracts", icon: "Code", entity: "CONTRACT", action: "VIEW_LIST" },
  { label: "Batch Transactions", href: "/batch", icon: "Layers", entity: "BATCH_TRANSACTION", action: "VIEW_LIST" },
  { label: "Investor Onboarding", href: "/investors", icon: "Users", entity: "INVESTOR", action: "VIEW_LIST" },
  { label: "Knowledge Base", href: "/knowledge-base", icon: "BookOpen", entity: "KNOWLEDGE_BASE", action: "VIEW_LIST" },
  { label: "Reporting & Logs", href: "/reports", icon: "FileText", entity: "REPORT", action: "VIEW" },
];
