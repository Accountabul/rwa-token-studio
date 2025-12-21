import React, { useState } from "react";
import { Role, roleLabel } from "@/types/tokenization";
import { rolePermissionsMatrix } from "@/types/reportsAndLogs";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewDashboard } from "@/components/reports/OverviewDashboard";
import { AuditLogViewer } from "@/components/reports/AuditLogViewer";
import { TransactionLedger } from "@/components/reports/TransactionLedger";
import { ReportsLibrary } from "@/components/reports/ReportsLibrary";
import { TaxCenter } from "@/components/reports/TaxCenter";
import { 
  LayoutDashboard, 
  ScrollText, 
  Receipt, 
  FileBarChart, 
  Building2,
  Lock
} from "lucide-react";

const ReportsLogs: React.FC = () => {
  const [role, setRole] = useState<Role>("SUPER_ADMIN");
  const permissions = rolePermissionsMatrix[role];

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, available: true },
    { id: "audit", label: "Audit Logs", icon: ScrollText, available: permissions.viewAuditLogs },
    { id: "ledger", label: "Transaction Ledger", icon: Receipt, available: permissions.viewLedger },
    { id: "reports", label: "Reports Library", icon: FileBarChart, available: permissions.runReports || permissions.exportReports },
    { id: "tax", label: "Tax Center", icon: Building2, available: permissions.viewTaxProfiles },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar role={role} onRoleChange={setRole} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Reports & Logs
            </h1>
            <p className="text-sm text-muted-foreground">
              Audit trails, transaction ledger, compliance reports, and tax center
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  disabled={!tab.available}
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 px-4 py-2"
                >
                  {tab.available ? (
                    <tab.icon className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <OverviewDashboard role={role} />
            </TabsContent>

            <TabsContent value="audit" className="mt-0">
              {permissions.viewAuditLogs ? (
                <AuditLogViewer role={role} />
              ) : (
                <AccessDenied />
              )}
            </TabsContent>

            <TabsContent value="ledger" className="mt-0">
              {permissions.viewLedger ? (
                <TransactionLedger role={role} />
              ) : (
                <AccessDenied />
              )}
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              {permissions.runReports || permissions.exportReports ? (
                <ReportsLibrary role={role} />
              ) : (
                <AccessDenied />
              )}
            </TabsContent>

            <TabsContent value="tax" className="mt-0">
              {permissions.viewTaxProfiles ? (
                <TaxCenter role={role} />
              ) : (
                <AccessDenied />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

const AccessDenied: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
      <Lock className="w-6 h-6 text-destructive" />
    </div>
    <h3 className="text-lg font-medium text-foreground mb-1">Access Denied</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      Your current role does not have permission to view this section.
      Contact an administrator if you need access.
    </p>
  </div>
);

export default ReportsLogs;
