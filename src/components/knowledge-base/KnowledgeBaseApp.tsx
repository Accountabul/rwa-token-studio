import { useState, useMemo } from "react";
import { Role, roleLabel } from "@/types/tokenization";
import { KBEntry, KBProposal, KBCategory, kbCategoryLabel } from "@/types/knowledgeBase";
import { mockKBEntries, mockKBProposals } from "@/data/mockKnowledgeBase";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { KBCategoryCard } from "./KBCategoryCard";
import { KBEntryList } from "./KBEntryList";
import { KBEntryDetail } from "./KBEntryDetail";
import { KBProposalsList } from "./KBProposalsList";
import { KBProposalDialog } from "./KBProposalDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, BookOpen, FileEdit } from "lucide-react";
import { toast } from "sonner";

const categories: KBCategory[] = ["projects_assets", "asset_classification", "xls89_metadata", "investor_compliance", "permissiondex"];

export function KnowledgeBaseApp() {
  const [role, setRole] = useState<Role>("TOKENIZATION_MANAGER");
  const [entries, setEntries] = useState<KBEntry[]>(mockKBEntries);
  const [proposals, setProposals] = useState<KBProposal[]>(mockKBProposals);
  const [selectedCategory, setSelectedCategory] = useState<KBCategory | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<KBEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KBEntry | null>(null);

  // Filter entries by category and search
  const filteredEntries = useMemo(() => {
    let result = entries;
    
    if (selectedCategory) {
      result = result.filter((e) => e.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.key.toLowerCase().includes(query) ||
          e.definition.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [entries, selectedCategory, searchQuery]);

  // Count entries per category
  const categoryCounts = useMemo(() => {
    const counts: Record<KBCategory, number> = {
      projects_assets: 0,
      asset_classification: 0,
      xls89_metadata: 0,
      investor_compliance: 0,
      permissiondex: 0,
    };
    entries.forEach((e) => {
      counts[e.category]++;
    });
    return counts;
  }, [entries]);

  const handleProposeEdit = (entry: KBEntry) => {
    setEditingEntry(entry);
    setProposalDialogOpen(true);
  };

  const handleNewProposal = () => {
    setEditingEntry(null);
    setProposalDialogOpen(true);
  };

  const handleSubmitProposal = (proposal: {
    entryId: string | null;
    category?: KBCategory;
    title: string;
    key: string;
    definition: string;
    allowedValues?: string;
    usageContext?: string;
    rationale: string;
  }) => {
    const newProposal: KBProposal = {
      id: `prop-${Date.now()}`,
      entryId: proposal.entryId,
      proposedTitle: proposal.title,
      proposedKey: proposal.key,
      proposedDefinition: proposal.definition,
      proposedAllowedValues: proposal.allowedValues?.split(",").map((v) => v.trim()).filter(Boolean),
      proposedUsageContext: proposal.usageContext,
      rationale: proposal.rationale,
      status: "pending",
      proposedBy: roleLabel[role],
      proposedAt: new Date(),
    };
    setProposals([newProposal, ...proposals]);
    toast.success("Proposal submitted for review");
  };

  const handleApproveProposal = (proposalId: string) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    if (proposal.entryId) {
      // Update existing entry
      setEntries(
        entries.map((e) => {
          if (e.id === proposal.entryId) {
            const newVersion = {
              id: `v${e.id}-${e.currentVersion + 1}`,
              version: e.currentVersion + 1,
              title: proposal.proposedTitle,
              key: proposal.proposedKey,
              definition: proposal.proposedDefinition,
              allowedValues: proposal.proposedAllowedValues,
              usageContext: proposal.proposedUsageContext,
              publishedAt: new Date(),
              publishedBy: roleLabel[role],
            };
            return {
              ...e,
              title: proposal.proposedTitle,
              key: proposal.proposedKey,
              definition: proposal.proposedDefinition,
              allowedValues: proposal.proposedAllowedValues,
              usageContext: proposal.proposedUsageContext,
              currentVersion: e.currentVersion + 1,
              versions: [...e.versions, newVersion],
              updatedAt: new Date(),
            };
          }
          return e;
        })
      );
    } else {
      // Create new entry
      const newEntry: KBEntry = {
        id: `kb-${Date.now()}`,
        category: "projects_assets", // Default, should come from proposal
        key: proposal.proposedKey,
        title: proposal.proposedTitle,
        definition: proposal.proposedDefinition,
        allowedValues: proposal.proposedAllowedValues,
        usageContext: proposal.proposedUsageContext,
        currentVersion: 1,
        versions: [
          {
            id: `v-new-1`,
            version: 1,
            title: proposal.proposedTitle,
            key: proposal.proposedKey,
            definition: proposal.proposedDefinition,
            allowedValues: proposal.proposedAllowedValues,
            usageContext: proposal.proposedUsageContext,
            publishedAt: new Date(),
            publishedBy: roleLabel[role],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setEntries([...entries, newEntry]);
    }

    setProposals(
      proposals.map((p) =>
        p.id === proposalId
          ? { ...p, status: "approved", reviewedBy: roleLabel[role], reviewedAt: new Date() }
          : p
      )
    );
    toast.success("Proposal approved and published");
  };

  const handleRejectProposal = (proposalId: string) => {
    setProposals(
      proposals.map((p) =>
        p.id === proposalId
          ? { ...p, status: "rejected", reviewedBy: roleLabel[role], reviewedAt: new Date() }
          : p
      )
    );
    toast.info("Proposal rejected");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar role={role} onRoleChange={setRole} />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold">Knowledge Base</h1>
                  <p className="text-sm text-muted-foreground">
                    Authoritative definitions for Accountabul
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleNewProposal}>
                <Plus className="h-4 w-4 mr-1" />
                New Definition
              </Button>
            </div>
          </div>
        </header>

        <div className="px-6 py-6 flex-1">
          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList>
              <TabsTrigger value="browse" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Browse
              </TabsTrigger>
              <TabsTrigger value="proposals" className="gap-2">
                <FileEdit className="h-4 w-4" />
                Proposals
                {proposals.filter((p) => p.status === "pending").length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {proposals.filter((p) => p.status === "pending").length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search definitions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Categories */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((cat) => (
                  <KBCategoryCard
                    key={cat}
                    category={cat}
                    entryCount={categoryCounts[cat]}
                    isSelected={selectedCategory === cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">
                      {selectedCategory ? kbCategoryLabel[selectedCategory] : "All Definitions"}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {filteredEntries.length} entries
                    </span>
                  </div>
                  <KBEntryList
                    entries={filteredEntries}
                    selectedEntryId={selectedEntry?.id || null}
                    onSelectEntry={setSelectedEntry}
                  />
                </div>
                <div className="lg:col-span-2">
                  {selectedEntry ? (
                    <KBEntryDetail
                      entry={selectedEntry}
                      role={role}
                      onProposeEdit={() => handleProposeEdit(selectedEntry)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      Select an entry to view details
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="proposals">
              <KBProposalsList
                proposals={proposals}
                role={role}
                onApprove={handleApproveProposal}
                onReject={handleRejectProposal}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <KBProposalDialog
        open={proposalDialogOpen}
        onOpenChange={setProposalDialogOpen}
        entry={editingEntry}
        onSubmit={handleSubmitProposal}
      />
    </div>
  );
}
