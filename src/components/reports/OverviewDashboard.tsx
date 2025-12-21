import React from "react";
import { Role } from "@/types/tokenization";
import { mockDashboardMetrics } from "@/data/mockReportsLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Clock, 
  Activity, 
  TrendingUp,
  DollarSign,
  RefreshCw,
  Vault,
  Lock,
  Snowflake,
  ArrowLeftRight
} from "lucide-react";

interface OverviewDashboardProps {
  role: Role;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ role }) => {
  const metrics = mockDashboardMetrics;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Open Issues */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Open Issues
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={AlertTriangle}
            iconColor="text-destructive"
            iconBg="bg-destructive/10"
            label="Failed Transactions"
            value={metrics.openIssues.failedTransactions}
            urgent={metrics.openIssues.failedTransactions > 0}
          />
          <MetricCard
            icon={Clock}
            iconColor="text-amber-500"
            iconBg="bg-amber-500/10"
            label="Pending Approvals"
            value={metrics.openIssues.pendingApprovals}
          />
          <MetricCard
            icon={AlertTriangle}
            iconColor="text-orange-500"
            iconBg="bg-orange-500/10"
            label="Missing Tax Forms"
            value={metrics.openIssues.missingTaxForms}
            urgent={metrics.openIssues.missingTaxForms > 0}
          />
        </div>
      </div>

      {/* Activity & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-semibold text-foreground">
                  {metrics.activity.last24h}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-semibold text-foreground">
                  {metrics.activity.last7d}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tokenization Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <PipelineBar 
                label="Intake" 
                pending={metrics.pipeline.intakePending} 
                complete={metrics.pipeline.intakeComplete} 
              />
              <PipelineBar 
                label="Metadata" 
                pending={metrics.pipeline.metadataDraft} 
                complete={metrics.pipeline.metadataApproved} 
              />
              <PipelineBar 
                label="Compliance" 
                pending={0} 
                complete={metrics.pipeline.complianceApproved} 
              />
              <PipelineBar 
                label="Custody" 
                pending={0} 
                complete={metrics.pipeline.custodyReady} 
              />
              <PipelineBar 
                label="Minted" 
                pending={0} 
                complete={metrics.pipeline.minted} 
                isFinal 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finance & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Finance (Month-to-Date)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <DollarSign className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(metrics.finance.payoutsMonthToDate)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Payouts</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <RefreshCw className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(metrics.finance.reversals)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Reversals</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Vault className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(metrics.finance.escrowBalances)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">In Escrow</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Compliance Events (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Lock className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">
                  {metrics.compliance.lockEvents}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Locks</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Snowflake className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">
                  {metrics.compliance.freezeEvents}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Freezes</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <ArrowLeftRight className="w-5 h-5 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">
                  {metrics.compliance.clawbackEvents}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Clawbacks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: number;
  urgent?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  urgent,
}) => (
  <Card className={urgent ? "border-destructive/50" : ""}>
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface PipelineBarProps {
  label: string;
  pending: number;
  complete: number;
  isFinal?: boolean;
}

const PipelineBar: React.FC<PipelineBarProps> = ({ label, pending, complete, isFinal }) => {
  const total = pending + complete;
  const completePercent = total > 0 ? (complete / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${isFinal ? "bg-primary" : "bg-primary/70"}`}
          style={{ width: `${Math.max(completePercent, total > 0 ? 5 : 0)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-foreground w-8 text-right">{complete}</span>
    </div>
  );
};
