import React from "react";
import { TokenizationProject } from "@/types/tokenization";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";

interface ProjectListProps {
  projects: TokenizationProject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedId,
  onSelect,
}) => {
  return (
    <section className="w-80 border-r border-border bg-muted/30 overflow-y-auto scrollbar-thin">
      <ul className="divide-y divide-border">
        {projects.map((project, index) => (
          <li key={project.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
            <button
              onClick={() => onSelect(project.id)}
              className={cn(
                "flex w-full flex-col items-start px-4 py-4 text-left transition-all duration-200 hover:bg-card",
                selectedId === project.id && "bg-card border-l-2 border-l-primary shadow-sm"
              )}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200",
                  selectedId === project.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm text-foreground line-clamp-1">
                    {project.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    {project.assetId || "No asset ID yet"}
                  </span>
                  <div className="mt-2 flex items-center justify-between w-full gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    <StatusBadge status={project.status} size="sm" />
                  </div>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
