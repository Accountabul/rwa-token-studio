import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  User,
  Loader2 
} from "lucide-react";
import { format } from "date-fns";
import { statusLabel, roleLabel } from "@/types/tokenization";
import { PhaseApproval } from "@/types/phaseTransition";
import { phaseTransitionService } from "@/domain/services/PhaseTransitionService";

interface PhaseApprovalHistoryProps {
  projectId: string;
}

export function PhaseApprovalHistory({ projectId }: PhaseApprovalHistoryProps) {
  const [approvals, setApprovals] = useState<PhaseApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApprovals();
  }, [projectId]);

  const loadApprovals = async () => {
    setIsLoading(true);
    const data = await phaseTransitionService.getApprovalHistory(projectId);
    setApprovals(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Phase Approval History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Phase Approval History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No phase approvals recorded yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group approvals by transition
  const groupedApprovals = approvals.reduce((acc, approval) => {
    const key = `${approval.from_status}-${approval.to_status}`;
    if (!acc[key]) {
      acc[key] = {
        from_status: approval.from_status,
        to_status: approval.to_status,
        approvals: [],
      };
    }
    acc[key].approvals.push(approval);
    return acc;
  }, {} as Record<string, { from_status: string; to_status: string; approvals: PhaseApproval[] }>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Phase Approval History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-6">
            {Object.values(groupedApprovals).map((group, index) => (
              <div key={index} className="space-y-3">
                {/* Transition Header */}
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Badge variant="outline">
                    {statusLabel[group.from_status as keyof typeof statusLabel] || group.from_status}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge>
                    {statusLabel[group.to_status as keyof typeof statusLabel] || group.to_status}
                  </Badge>
                </div>

                {/* Approval Cards */}
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  {group.approvals.map((approval) => (
                    <div
                      key={approval.id}
                      className="p-3 rounded-md bg-muted/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          <span className="font-medium text-sm">
                            {approval.approved_by_name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(approval.approved_at), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {roleLabel[approval.approved_by_role as keyof typeof roleLabel] || approval.approved_by_role}
                        </Badge>
                      </div>

                      {approval.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          "{approval.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
