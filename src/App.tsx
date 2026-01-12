import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AccessDenied from "./pages/AccessDenied";
import ResetPassword from "./pages/ResetPassword";
import Investors from "./pages/Investors";
import InvestorProfile from "./pages/InvestorProfile";
import KnowledgeBase from "./pages/KnowledgeBase";
import Tokens from "./pages/Tokens";
import TokenCreate from "./pages/TokenCreate";
import Escrows from "./pages/Escrows";
import EscrowDetailsPage from "./pages/EscrowDetailsPage";
import Wallets from "./pages/Wallets";
import Checks from "./pages/Checks";
import CheckDetailsPage from "./pages/CheckDetailsPage";
import PaymentChannels from "./pages/PaymentChannels";
import ChannelDetailsPage from "./pages/ChannelDetailsPage";
import AMM from "./pages/AMM";
import PoolDetailsPage from "./pages/PoolDetailsPage";
import SmartContracts from "./pages/SmartContracts";
import ContractDetailsPage from "./pages/ContractDetailsPage";
import BatchTransactions from "./pages/BatchTransactions";
import BatchBuilderPage from "./pages/BatchBuilderPage";
import BatchDetailsPage from "./pages/BatchDetailsPage";
import ReportsLogs from "./pages/ReportsLogs";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminRoles from "./pages/AdminRoles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investors"
              element={
                <ProtectedRoute>
                  <Investors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investors/:investorId"
              element={
                <ProtectedRoute>
                  <InvestorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowledge-base"
              element={
                <ProtectedRoute>
                  <KnowledgeBase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tokens"
              element={
                <ProtectedRoute>
                  <Tokens />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tokens/create"
              element={
                <ProtectedRoute>
                  <TokenCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/escrows"
              element={
                <ProtectedRoute>
                  <Escrows />
                </ProtectedRoute>
              }
            />
            <Route
              path="/escrows/:escrowId"
              element={
                <ProtectedRoute>
                  <EscrowDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallets"
              element={
                <ProtectedRoute>
                  <Wallets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checks"
              element={
                <ProtectedRoute>
                  <Checks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checks/:checkId"
              element={
                <ProtectedRoute>
                  <CheckDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/channels"
              element={
                <ProtectedRoute>
                  <PaymentChannels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/channels/:channelId"
              element={
                <ProtectedRoute>
                  <ChannelDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/amm"
              element={
                <ProtectedRoute>
                  <AMM />
                </ProtectedRoute>
              }
            />
            <Route
              path="/amm/:poolId"
              element={
                <ProtectedRoute>
                  <PoolDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts"
              element={
                <ProtectedRoute>
                  <SmartContracts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts/:contractId"
              element={
                <ProtectedRoute>
                  <ContractDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/batch"
              element={
                <ProtectedRoute>
                  <BatchTransactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/batch/new"
              element={
                <ProtectedRoute>
                  <BatchBuilderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/batch/:batchId"
              element={
                <ProtectedRoute>
                  <BatchDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:userId"
              element={
                <ProtectedRoute>
                  <AdminUserDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute>
                  <AdminRoles />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
