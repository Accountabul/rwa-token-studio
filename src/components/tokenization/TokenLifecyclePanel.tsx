import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role } from "@/types/tokenization";
import {
  MPTTransaction,
  AuthorizedHolder,
  TokenDistribution,
  TokenBalance,
} from "@/types/mptTransactions";
import { MPTFlagsState } from "@/lib/mptFlags";
import { AuthorizeHolderForm } from "./lifecycle/AuthorizeHolderForm";
import { DistributeTokensForm } from "./lifecycle/DistributeTokensForm";
import { ClawbackForm } from "./lifecycle/ClawbackForm";
import { LockControls } from "./lifecycle/LockControls";
import { TransactionHistory } from "./lifecycle/TransactionHistory";
import { RetireTokenForm } from "./lifecycle/RetireTokenForm";
import {
  UserPlus,
  Send,
  Lock,
  RotateCcw,
  History,
  Trash2,
} from "lucide-react";

interface TokenLifecyclePanelProps {
  projectId: string;
  role: Role;
  mptFlags: MPTFlagsState;
}

// Mock data for demonstration
const mockBalance: TokenBalance = {
  totalIssued: 1000000,
  circulating: 250000,
  locked: 50000,
  escrowed: 25000,
};

const mockHolders: AuthorizedHolder[] = [
  {
    id: "holder-1",
    address: "rN7n3473SaZBCG4dFL83w7a1RXtXtbK2D9",
    authorizedAt: "2025-12-01 10:30",
    authorizedBy: "custody_officer@accountabul.com",
    status: "AUTHORIZED",
  },
  {
    id: "holder-2",
    address: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    authorizedAt: "2025-12-02 14:15",
    authorizedBy: "custody_officer@accountabul.com",
    status: "AUTHORIZED",
  },
  {
    id: "holder-3",
    address: "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
    authorizedAt: "2025-11-28 09:00",
    authorizedBy: "admin@accountabul.com",
    status: "REVOKED",
    revokedAt: "2025-12-05 16:00",
  },
];

const mockDistributions: TokenDistribution[] = [
  {
    id: "dist-1",
    destination: "rN7n3473SaZBCG4dFL83w7a1RXtXtbK2D9",
    amount: 100000,
    memo: "Initial allocation",
    txHash: "ABC123DEF456789...",
    timestamp: "2025-12-03 11:00",
    distributedBy: "tokenization_manager@accountabul.com",
  },
  {
    id: "dist-2",
    destination: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    amount: 150000,
    txHash: "XYZ789ABC123456...",
    timestamp: "2025-12-04 09:30",
    distributedBy: "tokenization_manager@accountabul.com",
  },
];

const mockHolderBalances: Record<string, number> = {
  rN7n3473SaZBCG4dFL83w7a1RXtXtbK2D9: 100000,
  rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh: 150000,
};

const mockTransactions: MPTTransaction[] = [
  {
    id: "tx-1",
    type: "MPTokenIssuanceCreate",
    txHash: "F47AC10B58CC4372A5670E02B2C3D479",
    timestamp: "2025-12-01 09:00",
    actor: "admin@accountabul.com",
    actorRole: "SUPER_ADMIN",
    details: {},
  },
  {
    id: "tx-2",
    type: "MPTokenAuthorize",
    txHash: "7C9E6679E7D54708A5B2D6A2E8B4F9C1",
    timestamp: "2025-12-01 10:30",
    actor: "custody@accountabul.com",
    actorRole: "CUSTODY_OFFICER",
    details: { destination: "rN7n3473SaZBCG4dFL83w7a1RXtXtbK2D9" },
  },
  {
    id: "tx-3",
    type: "Payment",
    txHash: "3D8F2E1A9B4C5678D0E1F2A3B4C5D6E7",
    timestamp: "2025-12-03 11:00",
    actor: "manager@accountabul.com",
    actorRole: "TOKENIZATION_MANAGER",
    details: { destination: "rN7n3473SaZBCG4dFL83w7a1RXtXtbK2D9", amount: 100000 },
  },
  {
    id: "tx-4",
    type: "MPTokenIssuanceSet",
    txHash: "9A8B7C6D5E4F3G2H1I0J9K8L7M6N5O4P",
    timestamp: "2025-12-05 15:00",
    actor: "compliance@accountabul.com",
    actorRole: "COMPLIANCE_OFFICER",
    details: { lockType: "individual", isLocked: true },
  },
];

export const TokenLifecyclePanel: React.FC<TokenLifecyclePanelProps> = ({
  projectId,
  role,
  mptFlags,
}) => {
  const [holders, setHolders] = useState<AuthorizedHolder[]>(mockHolders);
  const [distributions, setDistributions] = useState<TokenDistribution[]>(mockDistributions);
  const [balance, setBalance] = useState<TokenBalance>(mockBalance);
  const [holderBalances, setHolderBalances] = useState<Record<string, number>>(mockHolderBalances);
  const [transactions, setTransactions] = useState<MPTTransaction[]>(mockTransactions);
  const [isGloballyLocked, setIsGloballyLocked] = useState(false);
  const [lockedHolders, setLockedHolders] = useState<string[]>([]);

  const handleAuthorize = (address: string) => {
    const newHolder: AuthorizedHolder = {
      id: `holder-${Date.now()}`,
      address,
      authorizedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      authorizedBy: "current_user@accountabul.com",
      status: "AUTHORIZED",
    };
    setHolders([...holders, newHolder]);
    addTransaction("MPTokenAuthorize", { destination: address });
  };

  const handleRevoke = (holderId: string) => {
    setHolders(
      holders.map((h) =>
        h.id === holderId
          ? { ...h, status: "REVOKED" as const, revokedAt: new Date().toISOString() }
          : h
      )
    );
  };

  const handleDistribute = (destination: string, amount: number, memo?: string) => {
    const newDist: TokenDistribution = {
      id: `dist-${Date.now()}`,
      destination,
      amount,
      memo,
      txHash: `${Math.random().toString(36).slice(2).toUpperCase()}...`,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      distributedBy: "current_user@accountabul.com",
    };
    setDistributions([newDist, ...distributions]);
    setBalance({ ...balance, circulating: balance.circulating + amount });
    setHolderBalances({
      ...holderBalances,
      [destination]: (holderBalances[destination] || 0) + amount,
    });
    addTransaction("Payment", { destination, amount });
  };

  const handleClawback = (holder: string, amount: number, reason: string) => {
    setBalance({ ...balance, circulating: balance.circulating - amount });
    setHolderBalances({
      ...holderBalances,
      [holder]: (holderBalances[holder] || 0) - amount,
    });
    addTransaction("Clawback", { destination: holder, amount, reason });
  };

  const handleGlobalLockToggle = (locked: boolean) => {
    setIsGloballyLocked(locked);
    addTransaction("MPTokenIssuanceSet", { lockType: "global", isLocked: locked });
  };

  const handleIndividualLockToggle = (address: string, locked: boolean) => {
    if (locked) {
      setLockedHolders([...lockedHolders, address]);
    } else {
      setLockedHolders(lockedHolders.filter((a) => a !== address));
    }
    addTransaction("MPTokenIssuanceSet", { lockType: "individual", isLocked: locked });
  };

  const handleRetire = () => {
    addTransaction("MPTokenIssuanceDestroy", {});
  };

  const addTransaction = (
    type: MPTTransaction["type"],
    details: MPTTransaction["details"]
  ) => {
    const newTx: MPTTransaction = {
      id: `tx-${Date.now()}`,
      type,
      txHash: `${Math.random().toString(36).slice(2, 10).toUpperCase()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      actor: "current_user@accountabul.com",
      actorRole: role,
      details,
    };
    setTransactions([newTx, ...transactions]);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Token Lifecycle Management
      </h3>

      <Tabs defaultValue="authorize" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-muted/50">
          <TabsTrigger value="authorize" className="text-xs py-2 gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            Authorize
          </TabsTrigger>
          <TabsTrigger value="distribute" className="text-xs py-2 gap-1.5">
            <Send className="w-3.5 h-3.5" />
            Distribute
          </TabsTrigger>
          <TabsTrigger value="lock" className="text-xs py-2 gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Lock
          </TabsTrigger>
          <TabsTrigger value="clawback" className="text-xs py-2 gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Clawback
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs py-2 gap-1.5">
            <History className="w-3.5 h-3.5" />
            History
          </TabsTrigger>
          <TabsTrigger value="retire" className="text-xs py-2 gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            Retire
          </TabsTrigger>
        </TabsList>

        <div className="mt-5">
          <TabsContent value="authorize" className="mt-0">
            <AuthorizeHolderForm
              projectId={projectId}
              role={role}
              holders={holders}
              onAuthorize={handleAuthorize}
              onRevoke={handleRevoke}
            />
          </TabsContent>

          <TabsContent value="distribute" className="mt-0">
            <DistributeTokensForm
              projectId={projectId}
              role={role}
              balance={balance}
              authorizedHolders={holders}
              distributions={distributions}
              onDistribute={handleDistribute}
            />
          </TabsContent>

          <TabsContent value="lock" className="mt-0">
            <LockControls
              projectId={projectId}
              role={role}
              canLock={mptFlags.canLock}
              isGloballyLocked={isGloballyLocked}
              authorizedHolders={holders}
              lockedHolders={lockedHolders}
              onGlobalLockToggle={handleGlobalLockToggle}
              onIndividualLockToggle={handleIndividualLockToggle}
            />
          </TabsContent>

          <TabsContent value="clawback" className="mt-0">
            <ClawbackForm
              projectId={projectId}
              role={role}
              canClawback={mptFlags.canClawback}
              authorizedHolders={holders}
              holderBalances={holderBalances}
              onClawback={handleClawback}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <TransactionHistory
              projectId={projectId}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="retire" className="mt-0">
            <RetireTokenForm
              projectId={projectId}
              role={role}
              balance={balance}
              onRetire={handleRetire}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
