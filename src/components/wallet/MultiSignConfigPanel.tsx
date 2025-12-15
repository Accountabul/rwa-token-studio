import React, { useState } from "react";
import { Plus, Trash2, Edit2, Shield, Users } from "lucide-react";
import { IssuingWallet } from "@/types/token";
import { MultiSignConfig, multiSignPermissions } from "@/types/multiSign";
import { Role } from "@/types/tokenization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SignerCard } from "./SignerCard";
import { toast } from "@/hooks/use-toast";

interface MultiSignConfigPanelProps {
  wallet: IssuingWallet;
  config: MultiSignConfig;
  role: Role;
}

export const MultiSignConfigPanel: React.FC<MultiSignConfigPanelProps> = ({ wallet, config, role }) => {
  const canUpdate = multiSignPermissions.updateSignerList.includes(role);
  const quorumPercent = (config.quorum / config.totalWeight) * 100;

  const handleAddSigner = () => {
    toast({
      title: "Add Signer",
      description: "This action requires multi-sig approval from existing signers.",
    });
  };

  const handleRemoveSigner = (signerId: string) => {
    toast({
      title: "Remove Signer",
      description: "This action requires multi-sig approval from existing signers.",
    });
  };

  const handleUpdateQuorum = () => {
    toast({
      title: "Update Quorum",
      description: "This action requires multi-sig approval from existing signers.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Wallet Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{wallet.name}</h2>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  {wallet.xrplAddress}
                </p>
              </div>
            </div>
            <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
              Multi-Signature Wallet
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quorum Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Quorum Threshold</CardTitle>
          {canUpdate && (
            <Button variant="outline" size="sm" onClick={handleUpdateQuorum}>
              <Edit2 className="w-4 h-4 mr-2" />
              Adjust
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">
                {config.quorum} <span className="text-lg text-muted-foreground">of</span> {config.totalWeight}
              </p>
              <p className="text-sm text-muted-foreground">
                weight required to approve transactions
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Threshold</p>
              <p className="text-lg font-semibold text-foreground">{Math.round(quorumPercent)}%</p>
            </div>
          </div>
          <Progress value={quorumPercent} className="h-3" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{config.signers.length}</p>
              <p className="text-xs text-muted-foreground">Total Signers</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{config.totalWeight}</p>
              <p className="text-xs text-muted-foreground">Total Weight</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{config.quorum}</p>
              <p className="text-xs text-muted-foreground">Required Weight</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signers List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Authorized Signers</CardTitle>
          </div>
          {canUpdate && (
            <Button size="sm" onClick={handleAddSigner}>
              <Plus className="w-4 h-4 mr-2" />
              Add Signer
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {config.signers.map((signer) => (
            <SignerCard
              key={signer.id}
              signer={signer}
              canRemove={canUpdate && config.signers.length > 1}
              onRemove={() => handleRemoveSigner(signer.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Multi-Signature Security</p>
              <p className="text-sm text-muted-foreground mt-1">
                All changes to signer list or quorum threshold require approval from existing signers
                meeting the current quorum. This ensures no single party can unilaterally modify wallet controls.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
