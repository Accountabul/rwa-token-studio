import React, { useState } from "react";
import { Role, TokenizationProject, statusOrder } from "@/types/tokenization";
import { initialProjects } from "@/data/mockProjects";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { Header } from "./Header";
import { ProjectList } from "./ProjectList";
import { ProjectDetails } from "./ProjectDetails";
import { FileSearch } from "lucide-react";
import { toast } from "sonner";

export const TokenizationAdminApp: React.FC = () => {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");
  const [projects, setProjects] = useState<TokenizationProject[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjects[0]?.id ?? null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  const updateProject = (id: string, updates: Partial<TokenizationProject>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const saveProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      toast.success("Project saved", {
        description: `"${project.propertyAddress || project.name}" has been saved successfully.`
      });
    }
  };

  const deleteProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    
    // Cannot delete minted projects
    if (project.status === "MINTED") {
      toast.error("Cannot delete minted project", {
        description: "Projects that have been minted on-ledger cannot be deleted."
      });
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    
    // Select next project or null
    const remaining = projects.filter((p) => p.id !== id);
    setSelectedProjectId(remaining[0]?.id ?? null);
    
    toast.success("Project deleted", {
      description: `"${project.propertyAddress || project.name}" has been removed.`
    });
  };

  const handleAdvanceStatus = () => {
    if (!selectedProject) return;
    const currentIndex = statusOrder.indexOf(selectedProject.status);
    if (currentIndex === -1 || currentIndex === statusOrder.length - 1) return;
    const nextStatus = statusOrder[currentIndex + 1];
    updateProject(selectedProject.id, { status: nextStatus });
  };

  const canAdvance = (project: TokenizationProject | null): boolean => {
    if (!project) return false;

    switch (project.status) {
      case "INTAKE_PENDING":
      case "INTAKE_COMPLETE":
      case "METADATA_DRAFT":
        return role === "TOKENIZATION_MANAGER" || role === "SUPER_ADMIN";
      case "METADATA_APPROVED":
        return role === "COMPLIANCE_OFFICER" || role === "SUPER_ADMIN";
      case "COMPLIANCE_APPROVED":
        return role === "CUSTODY_OFFICER" || role === "SUPER_ADMIN";
      case "CUSTODY_READY":
        return role === "SUPER_ADMIN";
      case "MINTED":
        return false;
      default:
        return false;
    }
  };

  const canDelete = (project: TokenizationProject | null): boolean => {
    if (!project) return false;
    // Only Super Admin and Tokenization Manager can delete, and not minted projects
    return (role === "SUPER_ADMIN" || role === "TOKENIZATION_MANAGER") && project.status !== "MINTED";
  };

  const handleNewProject = () => {
    const id = `proj-${String(projects.length + 1).padStart(3, "0")}`;
    const newProject: TokenizationProject = {
      id,
      name: "New Property",
      assetId: "",
      companyName: "",
      jurisdiction: "US-MO",
      assetClass: "rwa_re",
      assetSubclass: "sfr",
      valuationUsd: 0,
      valuationDate: new Date().toISOString().slice(0, 10),
      status: "INTAKE_PENDING",
      createdAt: new Date().toISOString(),
      xls89Metadata: JSON.stringify({ t: "", n: "", d: "", i: "", ac: "rwa_re", as: "sfr", in: "Accountabul", us: [], ai: {} }, null, 2),
      propertyAddress: "",
      ownerName: "",
      propertyNickname: "",
    };
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    toast.success("New project created", {
      description: "Fill in the property details to get started."
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar role={role} onRoleChange={setRole} />

      <main className="flex-1 flex flex-col min-h-screen">
        <Header onNewProject={handleNewProject} />

        <div className="flex flex-1 min-h-0">
          <ProjectList
            projects={projects}
            selectedId={selectedProjectId}
            onSelect={setSelectedProjectId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {selectedProject ? (
            <ProjectDetails
              project={selectedProject}
              role={role}
              onUpdate={(updates) => updateProject(selectedProject.id, updates)}
              onSave={() => saveProject(selectedProject.id)}
              onDelete={() => deleteProject(selectedProject.id)}
              onAdvanceStatus={handleAdvanceStatus}
              canAdvance={canAdvance(selectedProject)}
              canDelete={canDelete(selectedProject)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <FileSearch className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">Select a project to view details</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
