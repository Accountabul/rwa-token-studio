import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldX, Home, Mail, LogIn } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <Home className="w-5 h-5" />
            <span className="font-semibold">Accountabul</span>
          </Link>
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
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
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button className="flex-1" onClick={() => navigate("/auth")}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
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
    </div>
  );
};

export default AccessDenied;
