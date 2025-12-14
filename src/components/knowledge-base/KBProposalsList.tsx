import { KBProposal, KBProposalStatus, canPublishKB } from "@/types/knowledgeBase";
import { Role } from "@/types/tokenization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<KBProposalStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pending", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  approved: { label: "Approved", variant: "default", icon: <Check className="h-3 w-3" /> },
  rejected: { label: "Rejected", variant: "destructive", icon: <X className="h-3 w-3" /> },
};

interface KBProposalsListProps {
  proposals: KBProposal[];
  role: Role;
  onApprove: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
}

export function KBProposalsList({ proposals, role, onApprove, onReject }: KBProposalsListProps) {
  const canReview = canPublishKB(role);
  const pendingProposals = proposals.filter((p) => p.status === "pending");
  const reviewedProposals = proposals.filter((p) => p.status !== "pending");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Proposals</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-6 pr-4">
            {pendingProposals.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Pending Review ({pendingProposals.length})
                </h4>
                <div className="space-y-3">
                  {pendingProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      canReview={canReview}
                      onApprove={onApprove}
                      onReject={onReject}
                    />
                  ))}
                </div>
              </div>
            )}

            {reviewedProposals.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Reviewed ({reviewedProposals.length})
                </h4>
                <div className="space-y-3">
                  {reviewedProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      canReview={false}
                      onApprove={onApprove}
                      onReject={onReject}
                    />
                  ))}
                </div>
              </div>
            )}

            {proposals.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No proposals yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface ProposalCardProps {
  proposal: KBProposal;
  canReview: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function ProposalCard({ proposal, canReview, onApprove, onReject }: ProposalCardProps) {
  const config = statusConfig[proposal.status];

  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{proposal.proposedTitle}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {proposal.proposedKey}
            </Badge>
          </div>
          <Badge variant={config.variant} className="text-xs gap-1">
            {config.icon}
            {config.label}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(proposal.proposedAt, { addSuffix: true })}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
        {proposal.proposedDefinition}
      </p>

      <div className="text-xs text-muted-foreground mb-2">
        <span className="font-medium">Rationale:</span> {proposal.rationale}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Proposed by {proposal.proposedBy}
        </span>

        {canReview && proposal.status === "pending" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onReject(proposal.id)}
            >
              <X className="h-3 w-3 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={() => onApprove(proposal.id)}
            >
              <Check className="h-3 w-3 mr-1" />
              Approve & Publish
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
