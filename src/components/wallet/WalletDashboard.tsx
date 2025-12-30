import React, { useState, useCallback, useEffect } from "react";
import { Wallet, Shield, Clock, AlertCircle, Plus, RefreshCw } from "lucide-react";
import { Role } from "@/types/tokenization";
import { mockWallets } from "@/data/mockWallets";
import { mockPendingTransactions, mockMultiSignConfigs } from "@/data/mockPendingTransactions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WalletCard } from "./WalletCard";
import { MultiSignApprovalQueue } from "./MultiSignApprovalQueue";
import { MultiSignConfigPanel } from "./MultiSignConfigPanel";
import { ProvisionWalletDialog } from "./ProvisionWalletDialog";
import { IssuingWallet } from "@/types/token";
import { fetchWallets } from "@/lib/walletApi";
import { toast } from "sonner";

interface WalletDashboardProps {
  role: Role;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({ role }) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [showProvisionDialog, setShowProvisionDialog] = useState(false);
  const [wallets, setWallets] = useState<IssuingWallet[]>(mockWallets);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const multiSignWallets = wallets.filter((w) => w.multiSignEnabled);
  const pendingCount = mockPendingTransactions.filter((tx) => tx.status === "PENDING").length;
  const readyCount = mockPendingTransactions.filter((tx) => tx.status === "READY").length;
  const activeWallets = wallets.filter((w) => w.status === "ACTIVE").length;

  const selectedWallet = selectedWalletId ? wallets.find((w) => w.id === selectedWalletId) : null;
  const selectedConfig = selectedWalletId ? mockMultiSignConfigs[selectedWalletId] : null;

  const loadWallets = useCallback(async (showToast = false) => {
    try {
      const dbWallets = await fetchWallets();
      // Combine database wallets with mock wallets (DB wallets take priority)
      const dbAddresses = new Set(dbWallets.map(w => w.xrplAddress));
      const combinedWallets = [
        ...dbWallets,
        ...mockWallets.filter(w => !dbAddresses.has(w.xrplAddress))
      ];
      setWallets(combinedWallets);
      if (showToast) {
        toast.success("Wallets refreshed");
      }
    } catch (error) {
      console.error('[WalletDashboard] Error loading wallets:', error);
      // Fall back to mock data
      setWallets(mockWallets);
      if (showToast) {
        toast.error("Failed to refresh wallets");
      }
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    loadWallets().finally(() => setIsLoading(false));
  }, [loadWallets]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadWallets(true);
    setIsRefreshing(false);
  }, [loadWallets]);

  const handleProvisionSuccess = useCallback(async () => {
    await loadWallets();
  }, [loadWallets]);

  const canProvision = role === "SUPER_ADMIN";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wallet Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage issuing wallets, multi-signature configurations, and pending approvals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {canProvision && (
            <Button onClick={() => setShowProvisionDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Provision Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Active Wallets"
          value={activeWallets}
          total={wallets.length}
          iconColor="text-primary"
        />
        <StatCard
          icon={Shield}
          label="Multi-Sig Wallets"
          value={multiSignWallets.length}
          iconColor="text-purple-500"
        />
        <StatCard
          icon={Clock}
          label="Pending Signatures"
          value={pendingCount}
          iconColor="text-amber-500"
        />
        <StatCard
          icon={AlertCircle}
          label="Ready to Execute"
          value={readyCount}
          iconColor="text-green-500"
        />
      </div>

      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wallets">All Wallets</TabsTrigger>
          <TabsTrigger value="approvals">
            Pending Approvals
            {pendingCount > 0 && (
              <span className="ml-2 bg-amber-500/20 text-amber-600 text-xs px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="config">Multi-Sign Config</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  config={mockMultiSignConfigs[wallet.id]}
                  onSelect={() => setSelectedWalletId(wallet.id)}
                  isSelected={selectedWalletId === wallet.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approvals">
          <MultiSignApprovalQueue
            transactions={mockPendingTransactions}
            role={role}
          />
        </TabsContent>

        <TabsContent value="config">
          {selectedWallet && selectedConfig ? (
            <MultiSignConfigPanel
              wallet={selectedWallet}
              config={selectedConfig}
              role={role}
            />
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a multi-sig wallet from the "All Wallets" tab to view its configuration.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Provision Dialog */}
      <ProvisionWalletDialog
        open={showProvisionDialog}
        onOpenChange={setShowProvisionDialog}
        onSuccess={handleProvisionSuccess}
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  total?: number;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, total, iconColor }) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold text-foreground">
          {value}
          {total !== undefined && total !== value && (
            <span className="text-sm font-normal text-muted-foreground"> / {total}</span>
          )}
        </p>
      </div>
    </div>
  </div>
);
