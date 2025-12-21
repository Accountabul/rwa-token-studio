import React from "react";
import { useLocation } from "react-router-dom";
import { Role, roleLabel } from "@/types/tokenization";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Shield, 
  ChevronDown,
  Hexagon,
  BookOpen,
  Coins,
  Lock,
  Wallet,
  FileCheck,
  ArrowLeftRight,
  Waves,
  Code,
  Layers
} from "lucide-react";

interface AppSidebarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

const navItems = [
  { label: "Tokenization Projects", icon: LayoutDashboard, href: "/" },
  { label: "Token Registry", icon: Coins, href: "/tokens" },
  { label: "Escrows", icon: Lock, href: "/escrows" },
  { label: "Wallet Management", icon: Wallet, href: "/wallets" },
  { label: "Checks", icon: FileCheck, href: "/checks" },
  { label: "Payment Channels", icon: ArrowLeftRight, href: "/channels" },
  { label: "AMM Pools", icon: Waves, href: "/amm" },
  { label: "Smart Contracts", icon: Code, href: "/contracts" },
  { label: "Batch Transactions", icon: Layers, href: "/batch" },
  { label: "Investor Onboarding", icon: Users, href: "/investors" },
  { label: "Knowledge Base", icon: BookOpen, href: "/knowledge-base" },
  { label: "Reporting & Logs", icon: FileText, href: "/reports" },
];

const roles: Role[] = [
  "SUPER_ADMIN",
  "TOKENIZATION_MANAGER",
  "COMPLIANCE_OFFICER",
  "CUSTODY_OFFICER",
  "VALUATION_OFFICER",
  "FINANCE_OFFICER",
  "AUDITOR",
];

export const AppSidebar: React.FC<AppSidebarProps> = ({ role, onRoleChange }) => {
  const location = useLocation();

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="w-64 sidebar-gradient flex flex-col border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl accent-gradient flex items-center justify-center shadow-glow">
            <Hexagon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-sidebar-foreground tracking-tight">
              Accountabul Codex
            </h1>
            <p className="text-[10px] text-sidebar-muted font-medium uppercase tracking-wider mt-0.5">
              RWA Tokenization Engine
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4 flex-1 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href || "#"}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive(item.href) && "bg-sidebar-accent/10 text-sidebar-accent",
              !isActive(item.href) && "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Role Selector */}
      <div className="px-4 py-5 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-sidebar-muted font-medium">
          <Shield className="w-3 h-3" />
          <span>Current Role</span>
        </div>
        <div className="relative">
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value as Role)}
            className="w-full appearance-none rounded-lg bg-sidebar-foreground/5 border border-sidebar-border px-3 py-2 text-xs text-sidebar-foreground font-medium focus:outline-none focus:ring-2 focus:ring-sidebar-accent/50 transition-all duration-200 cursor-pointer pr-8"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-sidebar text-sidebar-foreground">
                {roleLabel[r]}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-muted pointer-events-none" />
        </div>
        <p className="text-[10px] text-sidebar-muted leading-relaxed">
          Switch roles to simulate different permission levels.
        </p>
      </div>
    </aside>
  );
};
