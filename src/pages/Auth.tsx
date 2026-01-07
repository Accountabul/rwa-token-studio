import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { Hexagon } from "lucide-react";

const Auth: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl accent-gradient flex items-center justify-center shadow-glow">
            <Hexagon className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Accountabul Codex
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              RWA Tokenization Engine
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
          <AuthForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;
