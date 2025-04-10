
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/dashboard/Profile";
import RoommateRecommendationsPage from "./pages/dashboard/RoommateRecommendations";
import RentOpportunitiesPage from "./pages/dashboard/RentOpportunities";
import CoOwnerRecommendationsPage from "./pages/dashboard/CoOwnerRecommendations";
import WalletPage from "./pages/dashboard/Wallet";
import LegalAssistantPage from "./pages/dashboard/LegalAssistant";
import ChatsPage from "./pages/dashboard/Chats";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<Profile />} />
                <Route path="profile" element={<Profile />} />
                <Route path="roommate-recommendations" element={<RoommateRecommendationsPage />} />
                <Route path="rent-opportunities" element={<RentOpportunitiesPage />} />
                <Route path="co-owner-recommendations" element={<CoOwnerRecommendationsPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="legal-assistant" element={<LegalAssistantPage />} />
                <Route path="chats" element={<ChatsPage />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
