import React, { useState } from "react";
import { Wallet, Shield, Users, AlertCircle, Clock } from "lucide-react";
import { Role } from "@/types/tokenization";
import { mockWallets } from "@/data/mockWallets";
import { mockPendingTransactions, mockMultiSignConfigs } from "@/data/mockPendingTransactions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletCard } from "./WalletCard";
import { MultiSignApprovalQueue } from "./MultiSignApprovalQueue";
import { MultiSignConfigPanel } from "./MultiSignConfigPanel";

interface WalletDashboardProps {
  role: Role;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({ role }) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const multiSignWallets = mockWallets.filter((w) => w.multiSignEnabled);
  const pendingCount = mockPendingTransactions.filter((tx) => tx.status === "PENDING").length;
  const readyCount = mockPendingTransactions.filter((tx) => tx.status === "READY").length;

  const selectedWallet = selectedWalletId ? mockWallets.find((w) => w.id === selectedWalletId) : null;
  const selectedConfig = selectedWalletId ? mockMultiSignConfigs[selectedWalletId] : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Wallet Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage issuing wallets, multi-signature configurations, and pending approvals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Total Wallets"
          value={mockWallets.length}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockWallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                config={mockMultiSignConfigs[wallet.id]}
                onSelect={() => setSelectedWalletId(wallet.id)}
                isSelected={selectedWalletId === wallet.id}
              />
            ))}
          </div>
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
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, iconColor }) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);
