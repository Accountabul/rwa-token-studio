import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/investors/:investorId" element={<InvestorProfile />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/tokens" element={<Tokens />} />
          <Route path="/tokens/create" element={<TokenCreate />} />
          <Route path="/escrows" element={<Escrows />} />
          <Route path="/escrows/:escrowId" element={<EscrowDetailsPage />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/checks" element={<Checks />} />
          <Route path="/checks/:checkId" element={<CheckDetailsPage />} />
          <Route path="/channels" element={<PaymentChannels />} />
          <Route path="/channels/:channelId" element={<ChannelDetailsPage />} />
          <Route path="/amm" element={<AMM />} />
          <Route path="/amm/:poolId" element={<PoolDetailsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;