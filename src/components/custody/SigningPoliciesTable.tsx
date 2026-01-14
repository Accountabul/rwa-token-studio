import React from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Shield, Clock, Users } from "lucide-react";
import { SigningPolicy } from "@/types/custody";
import { cn } from "@/lib/utils";

interface SigningPoliciesTableProps {
  policies: SigningPolicy[];
  loading?: boolean;
  onEdit: (policy: SigningPolicy) => void;
  onDelete: (policy: SigningPolicy) => void;
  onToggleActive: (policy: SigningPolicy, active: boolean) => void;
}

export const SigningPoliciesTable: React.FC<SigningPoliciesTableProps> = ({
  policies,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Shield className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No signing policies configured</p>
        <p className="text-sm">Create a policy to control transaction signing behavior</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Policy Name</TableHead>
            <TableHead>Network</TableHead>
            <TableHead>Wallet Roles</TableHead>
            <TableHead>Limits</TableHead>
            <TableHead>Multi-Sign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow key={policy.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{policy.policyName}</p>
                  {policy.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {policy.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={policy.network === "mainnet" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {policy.network}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {policy.walletRoles.slice(0, 2).map((role) => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {role.replace("_", " ")}
                    </Badge>
                  ))}
                  {policy.walletRoles.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{policy.walletRoles.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-xs">
                  {policy.maxAmountXrp && (
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">Max:</span>
                      {policy.maxAmountXrp.toLocaleString()} XRP
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {policy.rateLimitPerMinute}/min
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {policy.requiresMultiSign ? (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">{policy.minSigners} signers</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Single</span>
                )}
              </TableCell>
              <TableCell>
                <Switch
                  checked={policy.isActive}
                  onCheckedChange={(checked) => onToggleActive(policy, checked)}
                  aria-label="Toggle policy active"
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(policy)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(policy)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
