import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { SigningPolicy } from "@/types/custody";
import { SigningPoliciesTable } from "@/components/custody/SigningPoliciesTable";
import { SigningPolicyDialog } from "@/components/custody/SigningPolicyDialog";
import { signingPolicyService } from "@/domain/services/SigningPolicyService";

const SigningPolicies: React.FC = () => {
  const [policies, setPolicies] = useState<SigningPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [networkFilter, setNetworkFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SigningPolicy | null>(null);
  const [deletePolicy, setDeletePolicy] = useState<SigningPolicy | null>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await signingPolicyService.getPolicies();
      setPolicies(data);
    } catch (error) {
      toast.error("Failed to load signing policies");
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.policyName.toLowerCase().includes(search.toLowerCase()) ||
      policy.description?.toLowerCase().includes(search.toLowerCase());
    const matchesNetwork = networkFilter === "all" || policy.network === networkFilter;
    return matchesSearch && matchesNetwork;
  });

  const handleCreate = () => {
    setEditingPolicy(null);
    setDialogOpen(true);
  };

  const handleEdit = (policy: SigningPolicy) => {
    setEditingPolicy(policy);
    setDialogOpen(true);
  };

  const handleSave = async (
    policyData: Omit<SigningPolicy, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editingPolicy) {
        await signingPolicyService.updatePolicy(editingPolicy.id, policyData);
        toast.success("Policy updated successfully");
      } else {
        await signingPolicyService.createPolicy(policyData);
        toast.success("Policy created successfully");
      }
      await loadPolicies();
    } catch (error) {
      toast.error("Failed to save policy");
      throw error;
    }
  };

  const handleToggleActive = async (policy: SigningPolicy, active: boolean) => {
    try {
      await signingPolicyService.togglePolicyActive(policy.id, active);
      setPolicies((prev) =>
        prev.map((p) => (p.id === policy.id ? { ...p, isActive: active } : p))
      );
      toast.success(`Policy ${active ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error("Failed to update policy status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletePolicy) return;

    try {
      await signingPolicyService.deletePolicy(deletePolicy.id);
      setPolicies((prev) => prev.filter((p) => p.id !== deletePolicy.id));
      toast.success("Policy deleted successfully");
    } catch (error) {
      toast.error("Failed to delete policy");
    } finally {
      setDeletePolicy(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar role="CUSTODY_OFFICER" onRoleChange={() => {}} />
        <div className="flex-1">
          <PageHeader
            title="Signing Policies"
            subtitle="Configure rules for transaction signing based on wallet roles and transaction types"
            actions={
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            }
          />

          <main className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={networkFilter} onValueChange={setNetworkFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Networks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                  <SelectItem value="testnet">Testnet</SelectItem>
                  <SelectItem value="devnet">Devnet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <SigningPoliciesTable
              policies={filteredPolicies}
              loading={loading}
              onEdit={handleEdit}
              onDelete={setDeletePolicy}
              onToggleActive={handleToggleActive}
            />
          </main>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <SigningPolicyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        policy={editingPolicy}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePolicy} onOpenChange={() => setDeletePolicy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Signing Policy?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletePolicy?.policyName}". Transactions
              that matched this policy will need to be covered by other policies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default SigningPolicies;
