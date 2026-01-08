import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldX, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { roleLabel } from "@/types/tokenization";

interface AccessDeniedState {
  requestedRoute?: string;
  requiredEntity?: string;
  requiredAction?: string;
}

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roles, profile } = useAuth();

  const state = location.state as AccessDeniedState | undefined;
  const requestedRoute = state?.requestedRoute || "the requested page";
  const requiredEntity = state?.requiredEntity;
  const requiredAction = state?.requiredAction;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base mt-2">
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Requested Route */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Requested Page</span>
              <code className="px-2 py-1 rounded bg-muted text-foreground font-mono text-xs">
                {requestedRoute}
              </code>
            </div>

            {requiredEntity && requiredAction && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Required Permission</span>
                <span className="text-foreground font-medium">
                  {requiredEntity} → {requiredAction}
                </span>
              </div>
            )}

            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Your Roles</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {roleLabel[role]}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    No roles assigned
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Admin */}
          <div className="rounded-lg border border-border p-4 space-y-2">
            <h4 className="text-sm font-medium">Need Access?</h4>
            <p className="text-sm text-muted-foreground">
              Contact your administrator to request the appropriate role permissions.
            </p>
            <a
              href="mailto:admin@accountabul.com?subject=Access Request"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              admin@accountabul.com
            </a>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button className="flex-1" onClick={() => navigate("/")}>
              Go to Dashboard
            </Button>
          </div>

          {/* Current User */}
          {profile && (
            <p className="text-xs text-center text-muted-foreground">
              Signed in as {profile.email}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
