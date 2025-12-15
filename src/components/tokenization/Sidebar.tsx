import React from "react";
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
  Coins
} from "lucide-react";

interface SidebarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

const navItems = [
  { label: "Tokenization Projects", icon: LayoutDashboard, active: true, href: "/" },
  { label: "Token Registry", icon: Coins, active: false, href: "/tokens" },
  { label: "Investor Onboarding", icon: Users, active: false, href: "/investors" },
  { label: "Knowledge Base", icon: BookOpen, active: false, href: "/knowledge-base" },
  { label: "Reporting & Logs", icon: FileText, disabled: true },
];

const roles: Role[] = [
  "SUPER_ADMIN",
  "TOKENIZATION_MANAGER",
  "COMPLIANCE_OFFICER",
  "CUSTODY_OFFICER",
  "VALUATION_OFFICER",
];

export const Sidebar: React.FC<SidebarProps> = ({ role, onRoleChange }) => {
  return (
    <aside className="w-64 sidebar-gradient flex flex-col border-r border-sidebar-border">
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
              item.active && "bg-sidebar-accent/10 text-sidebar-accent",
              !item.active && !item.disabled && "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
              item.disabled && "text-sidebar-muted/50 cursor-not-allowed pointer-events-none"
            )}
            onClick={(e) => item.disabled && e.preventDefault()}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
            {item.disabled && (
              <span className="ml-auto text-[9px] uppercase tracking-wider bg-sidebar-foreground/10 px-1.5 py-0.5 rounded text-sidebar-muted">
                Soon
              </span>
            )}
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
          Switch roles to simulate different permission levels for the tokenization workflow.
        </p>
      </div>
    </aside>
  );
};
