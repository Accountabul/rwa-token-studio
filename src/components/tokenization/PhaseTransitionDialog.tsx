import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Shield,
  Loader2,
  Bell
} from "lucide-react";
import { ProjectStatus, Role, statusLabel, roleLabel } from "@/types/tokenization";
import { PhaseTransitionRule, PhaseApproval } from "@/types/phaseTransition";
import { phaseTransitionService } from "@/domain/services/PhaseTransitionService";

interface PhaseTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  userId: string;
  userName: string;
  userRole: Role;
  onTransitionComplete: (success: boolean, completed: boolean, newStatus?: ProjectStatus) => void;
}

export function PhaseTransitionDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  fromStatus,
  toStatus,
  userId,
  userName,
  userRole,
  onTransitionComplete,
}: PhaseTransitionDialogProps) {
  const [rule, setRule] = useState<PhaseTransitionRule | null>(null);
  const [currentApprovals, setCurrentApprovals] = useState<PhaseApproval[]>([]);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadTransitionData();
    }
  }, [open, projectId, fromStatus, toStatus]);

  const loadTransitionData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [fetchedRule, approvals] = await Promise.all([
        phaseTransitionService.getTransitionRule(fromStatus, toStatus),
        phaseTransitionService.getCurrentApprovals(projectId, fromStatus, toStatus),
      ]);

      setRule(fetchedRule);
      setCurrentApprovals(approvals);
    } catch (err) {
      setError("Failed to load transition data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirmed) {
      setError("Please confirm you have reviewed the requirements");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await phaseTransitionService.submitApproval(
        projectId,
        fromStatus,
        toStatus,
        userId,
        userName,
        userRole,
        notes || undefined
      );

      if (result.success) {
        onTransitionComplete(true, result.completed, result.completed ? toStatus : undefined);
        onOpenChange(false);
        setNotes("");
        setConfirmed(false);
      } else {
        setError(result.message || "Failed to submit approval");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasUserApproved = currentApprovals.some(a => a.approved_by === userId);
  const canApprove = rule && (
    rule.required_roles.includes(userRole) || userRole === "SUPER_ADMIN"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Advance Phase
          </DialogTitle>
          <DialogDescription>
            Approve transition from <strong>{statusLabel[fromStatus]}</strong> to{" "}
            <strong>{statusLabel[toStatus]}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rule ? (
          <div className="space-y-4">
            {/* Project Info */}
            <div className="p-3 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="font-medium">{projectName}</p>
            </div>

            {/* Required Approvers */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Required Approvers</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {rule.required_roles.map((role) => (
                  <Badge key={role} variant="outline">
                    {roleLabel[role] || role}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Approval Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Approval Progress</span>
                <Badge variant={currentApprovals.length >= rule.required_approvals ? "default" : "secondary"}>
                  {currentApprovals.length} / {rule.required_approvals}
                </Badge>
              </div>
              
              {currentApprovals.length > 0 && (
                <div className="space-y-1">
                  {currentApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      <span>{approval.approved_by_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {roleLabel[approval.approved_by_role] || approval.approved_by_role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            {(rule.notify_all_users || rule.notify_roles.length > 0) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                {rule.notify_all_users ? (
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Platform-wide announcement:</strong> All users will be notified of this new token offering.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Will notify: {rule.notify_roles.map(r => roleLabel[r] || r).join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Already Approved Warning */}
            {hasUserApproved && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  You have already approved this transition.
                </AlertDescription>
              </Alert>
            )}

            {/* Cannot Approve Warning */}
            {!canApprove && !hasUserApproved && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your role ({roleLabel[userRole]}) is not authorized to approve this transition.
                </AlertDescription>
              </Alert>
            )}

            {/* Notes */}
            {canApprove && !hasUserApproved && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this approval..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Confirmation */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confirm"
                    checked={confirmed}
                    onCheckedChange={(checked) => setConfirmed(checked === true)}
                  />
                  <Label htmlFor="confirm" className="text-sm">
                    I confirm this project meets all requirements for {statusLabel[toStatus]}
                  </Label>
                </div>
              </>
            )}
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No transition rule found for this phase change.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {canApprove && !hasUserApproved && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !confirmed}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Approve & Advance"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
