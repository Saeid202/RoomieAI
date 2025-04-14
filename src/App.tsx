import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import Dashboard from "@/pages/Dashboard";
import HomePage from "@/pages/Home";
import RoommateRecommendationsPage from "@/pages/dashboard/RoommateRecommendations";
import AuthPage from "@/pages/Auth";
import Callback from "@/pages/auth/Callback";
import Profile from "@/pages/dashboard/Profile";
import WalletPage from "@/pages/dashboard/Wallet";
import LegalAssistantPage from "@/pages/dashboard/LegalAssistant";
import RentOpportunitiesPage from "@/pages/dashboard/RentOpportunities";
import ChatsPage from "@/pages/dashboard/Chats";
import RentSavingsPage from "@/pages/dashboard/RentSavings";
import CoOwnerRecommendationsPage from "@/pages/dashboard/CoOwnerRecommendations";
import FutureHousingPlan from "@/pages/dashboard/FutureHousingPlan";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<Callback />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="profile" element={<Profile />} />
            <Route path="roommate-recommendations" element={<RoommateRecommendationsPage />} />
            <Route path="future-housing-plan" element={<FutureHousingPlan />} />
            <Route path="rent-opportunities" element={<RentOpportunitiesPage />} />
            <Route path="rent-savings" element={<RentSavingsPage />} />
            <Route path="co-owner-recommendations" element={<CoOwnerRecommendationsPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="legal-assistant" element={<LegalAssistantPage />} />
            <Route path="chats" element={<ChatsPage />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
