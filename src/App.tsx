
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleProvider } from "@/contexts/RoleContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/dashboard/Profile";
import RoommateRecommendationsPage from "./pages/dashboard/RoommateRecommendations";
import RentOpportunitiesPage from "./pages/dashboard/RentOpportunities";
import RentSavingsPage from "./pages/dashboard/RentSavings";
import CoOwnerRecommendationsPage from "./pages/dashboard/CoOwnerRecommendations";
import CoOwnershipOpportunitiesPage from "./pages/dashboard/CoOwnershipOpportunities";
import WalletPage from "./pages/dashboard/Wallet";
import LegalAssistantPage from "./pages/dashboard/LegalAssistant";
import ChatsPage from "./pages/dashboard/Chats";
import Callback from "./pages/auth/Callback";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

// Landlord routes
import LandlordHomePage from "./pages/dashboard/landlord/LandlordHome";
import PropertiesPage from "./pages/dashboard/landlord/Properties";
import AddPropertyPage from "./pages/dashboard/landlord/AddProperty";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RoleProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-1 flex flex-col">
                <Routes>
                  <Route path="/" element={<Index />} />
                  
                  {/* Auth Routes */}
                  <Route path="/auth/callback" element={<Callback />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Protected Dashboard Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }>
                    {/* Seeker Routes */}
                    <Route index element={<Profile />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="profile/roommate" element={<Profile />} />
                    <Route path="profile/co-owner" element={<Profile />} />
                    <Route path="roommate-recommendations" element={<RoommateRecommendationsPage />} />
                    <Route path="rent-opportunities" element={<RentOpportunitiesPage />} />
                    <Route path="rent-savings" element={<RentSavingsPage />} />
                    <Route path="co-owner-recommendations" element={<CoOwnerRecommendationsPage />} />
                    <Route path="co-ownership-opportunities" element={<CoOwnershipOpportunitiesPage />} />
                    <Route path="wallet" element={<WalletPage />} />
                    <Route path="legal-assistant" element={<LegalAssistantPage />} />
                    <Route path="chats" element={<ChatsPage />} />
                    
                    {/* Landlord Routes */}
                    <Route path="landlord" element={<LandlordHomePage />} />
                    <Route path="properties" element={<PropertiesPage />} />
                    <Route path="properties/add" element={<AddPropertyPage />} />
                  </Route>
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              {/* Only show footer on non-dashboard pages since we're adding it directly to Dashboard component */}
              <Routes>
                <Route path="/" element={<Footer />} />
                <Route path="/auth/*" element={<Footer />} />
                <Route path="/reset-password" element={<Footer />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </RoleProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
