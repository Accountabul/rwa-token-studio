import React from "react";
import { TokenizationProject } from "@/types/tokenization";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { MapPin, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProjectListProps {
  projects: TokenizationProject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}) => {
  const filteredProjects = projects.filter((project) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.propertyAddress?.toLowerCase().includes(query) ||
      project.ownerName?.toLowerCase().includes(query) ||
      project.propertyNickname?.toLowerCase().includes(query) ||
      project.companyName?.toLowerCase().includes(query) ||
      project.assetId?.toLowerCase().includes(query) ||
      project.name?.toLowerCase().includes(query)
    );
  });

  return (
    <section className="w-80 border-r border-border bg-muted/30 overflow-hidden flex flex-col">
      {/* Search Bar */}
      <div className="p-3 border-b border-border bg-card/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by address, owner, or name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {filteredProjects.length} of {projects.length} projects
        </p>
      </div>

      {/* Project List */}
      <ul className="divide-y divide-border overflow-y-auto scrollbar-thin flex-1">
        {filteredProjects.map((project, index) => (
          <li key={project.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
            <button
              onClick={() => onSelect(project.id)}
              className={cn(
                "flex w-full flex-col items-start px-4 py-4 text-left transition-all duration-200 hover:bg-card",
                selectedId === project.id && "bg-card border-l-2 border-l-primary shadow-sm"
              )}
            >
              <div className="flex flex-col w-full gap-1.5">
                {/* Property Address - Primary */}
                <div className="flex items-start gap-2">
                  <MapPin className={cn(
                    "w-4 h-4 flex-shrink-0 mt-0.5 transition-colors duration-200",
                    selectedId === project.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="font-medium text-sm text-foreground line-clamp-2 leading-tight">
                    {project.propertyAddress || project.name || "Address not set"}
                  </span>
                </div>

                {/* Owner Name - Secondary */}
                <div className="flex items-center gap-2 pl-6">
                  <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {project.ownerName || project.companyName || "Owner not set"}
                  </span>
                </div>

                {/* Nickname if available */}
                {project.propertyNickname && (
                  <div className="pl-6">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {project.propertyNickname}
                    </span>
                  </div>
                )}

                {/* Footer: Date + Status */}
                <div className="mt-2 flex items-center justify-between w-full gap-2 pl-6">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                  <StatusBadge status={project.status} size="sm" />
                </div>
              </div>
            </button>
          </li>
        ))}

        {filteredProjects.length === 0 && (
          <li className="p-8 text-center">
            <Search className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No projects found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
          </li>
        )}
      </ul>
    </section>
  );
};
