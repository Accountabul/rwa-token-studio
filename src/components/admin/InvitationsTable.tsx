import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Invitation, InvitationStatus, invitationStatusLabel, invitationStatusColor } from "@/types/invitation";
import { roleLabel, Role } from "@/types/tokenization";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Clock, MoreHorizontal, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvitationsTableProps {
  statusFilter?: InvitationStatus;
}

export const InvitationsTable: React.FC<InvitationsTableProps> = ({
  statusFilter,
}) => {
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [selectedInvitation, setSelectedInvitation] = React.useState<Invitation | null>(null);

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["invitations", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("invitations")
        .select("*")
        .order("invited_at", { ascending: false });

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Type conversion for initial_roles since Supabase returns it as unknown[]
      return (data || []).map(inv => ({
        ...inv,
        initial_roles: (inv.initial_roles || []) as Role[],
      })) as Invitation[];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("invitations")
        .update({ status: "CANCELLED" })
        .eq("id", invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation cancelled");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setCancelDialogOpen(false);
      setSelectedInvitation(null);
    },
    onError: () => {
      toast.error("Failed to cancel invitation");
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      // Reset expiry to 7 days from now
      const { error } = await supabase
        .from("invitations")
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "PENDING",
        })
        .eq("id", invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation resent");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: () => {
      toast.error("Failed to resend invitation");
    },
  });

  const getStatusBadge = (invitation: Invitation) => {
    // Check if expired but status not updated
    const isExpired = isPast(new Date(invitation.expires_at)) && invitation.status === "PENDING";
    const status = isExpired ? "EXPIRED" : invitation.status;
    
    return (
      <Badge
        variant="secondary"
        className={cn(invitationStatusColor[status as InvitationStatus])}
      >
        {invitationStatusLabel[status as InvitationStatus]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p>No invitations found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Initial Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const isExpired = isPast(new Date(invitation.expires_at));
              const canCancel = invitation.status === "PENDING" && !isExpired;
              const canResend = invitation.status === "PENDING" || invitation.status === "EXPIRED" || isExpired;

              return (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {invitation.first_name} {invitation.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invitation.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {invitation.department || "-"}
                      {invitation.job_title && (
                        <div className="text-muted-foreground text-xs">
                          {invitation.job_title}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {invitation.initial_roles.length === 0 ? (
                        <span className="text-sm text-muted-foreground">None</span>
                      ) : (
                        invitation.initial_roles.slice(0, 2).map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {roleLabel[role]}
                          </Badge>
                        ))
                      )}
                      {invitation.initial_roles.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{invitation.initial_roles.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invitation)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {isPast(new Date(invitation.expires_at)) ? (
                        <span className="text-destructive">Expired</span>
                      ) : (
                        formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canResend && (
                          <DropdownMenuItem
                            onClick={() => resendMutation.mutate(invitation.id)}
                            disabled={resendMutation.isPending}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Resend Invitation
                          </DropdownMenuItem>
                        )}
                        {canCancel && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedInvitation(invitation);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Invitation
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation for{" "}
              <span className="font-medium text-foreground">
                {selectedInvitation?.first_name} {selectedInvitation?.last_name}
              </span>
              ? They will no longer be able to accept this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedInvitation && cancelMutation.mutate(selectedInvitation.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
