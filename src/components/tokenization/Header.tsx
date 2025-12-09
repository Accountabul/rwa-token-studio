import React from "react";
import { Plus } from "lucide-react";

interface HeaderProps {
  onNewProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewProject }) => {
  return (
    <header className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Tokenization Projects
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage asset intake, XLS-89 metadata, compliance, custody, and minting from a single screen.
        </p>
      </div>
      <button
        onClick={onNewProject}
        className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2.5 text-sm font-semibold shadow-card hover:bg-foreground/90 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span>New Project</span>
      </button>
    </header>
  );
};
