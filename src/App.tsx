
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import Dashboard from "@/pages/Dashboard";
import HomePage from "@/pages/Home";
import RoommateRecommendationsPage from "@/pages/dashboard/RoommateRecommendations";
import RentalOptionsPage from "@/pages/dashboard/RentalOptions";
import PlanAheadMatchingPage from "@/pages/dashboard/PlanAheadMatching";
import OppositeSchedulePage from "@/pages/dashboard/OppositeSchedule";
import ShortTermPage from "@/pages/dashboard/ShortTerm";
import GroupMatchingPage from "@/pages/dashboard/GroupMatching";
import WorkExchangePage from "@/pages/dashboard/WorkExchange";
import LGBTQMatchingPage from "@/pages/dashboard/LGBTQMatching";
import LandlordDashboardPage from "@/pages/dashboard/landlord/LandlordDashboard";
import PropertiesPage from "@/pages/dashboard/landlord/Properties";
import ApplicationsPage from "@/pages/dashboard/landlord/Applications";
import AddPropertyPage from "@/pages/dashboard/landlord/AddProperty";
import FindPropertyPage from "@/pages/dashboard/FindProperty";
import AuthPage from "@/pages/Auth";
import Callback from "@/pages/auth/Callback";
import Profile from "@/pages/dashboard/Profile";
import LegalAssistantPage from "@/pages/dashboard/LegalAssistant";
import RentOpportunitiesPage from "@/pages/dashboard/RentOpportunities";
import ChatsPage from "@/pages/dashboard/Chats";
import RentSavingsPage from "@/pages/dashboard/RentSavings";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminHomePage from "@/pages/dashboard/admin/AdminHome";
import PagesPage from "@/pages/dashboard/admin/Pages";
import UsersPage from "@/pages/dashboard/admin/Users";
import SettingsPage from "@/pages/dashboard/Settings";
import MatchesPage from "@/pages/dashboard/Matches";
import { useAuth } from "@/hooks/useAuth";

function AppRoutes() {
  const { user, loading } = useAuth();
  
  // If user is authenticated, redirect from root to dashboard
  if (!loading && user) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route path="profile" element={<Profile />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="roommate-recommendations" element={<RoommateRecommendationsPage />} />
          <Route path="rental-options" element={<RentalOptionsPage />} />
          <Route path="plan-ahead-matching" element={<PlanAheadMatchingPage />} />
          <Route path="opposite-schedule" element={<OppositeSchedulePage />} />
          <Route path="short-term" element={<ShortTermPage />} />
          <Route path="group-matching" element={<GroupMatchingPage />} />
          <Route path="work-exchange" element={<WorkExchangePage />} />
          <Route path="lgbtq-matching" element={<LGBTQMatchingPage />} />
          <Route path="landlord" element={<LandlordDashboardPage />} />
          <Route path="landlord/properties" element={<PropertiesPage />} />
          <Route path="landlord/applications" element={<ApplicationsPage />} />
          <Route path="landlord/add-property" element={<AddPropertyPage />} />
          <Route path="rent-opportunities" element={<RentOpportunitiesPage />} />
          <Route path="find-property" element={<FindPropertyPage />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="rent-savings" element={<RentSavingsPage />} />
          <Route path="legal-assistant" element={<LegalAssistantPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<AdminHomePage />} />
          <Route path="admin/pages" element={<PagesPage />} />
          <Route path="admin/users" element={<UsersPage />} />
          <Route path="admin/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    );
  }
  
  // If user is not authenticated, show normal routes
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<Callback />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }>
        <Route path="profile" element={<Profile />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route path="roommate-recommendations" element={<RoommateRecommendationsPage />} />
        <Route path="rental-options" element={<RentalOptionsPage />} />
        <Route path="plan-ahead-matching" element={<PlanAheadMatchingPage />} />
        <Route path="opposite-schedule" element={<OppositeSchedulePage />} />
        <Route path="short-term" element={<ShortTermPage />} />
        <Route path="group-matching" element={<GroupMatchingPage />} />
        <Route path="work-exchange" element={<WorkExchangePage />} />
        <Route path="lgbtq-matching" element={<LGBTQMatchingPage />} />
        <Route path="landlord" element={<LandlordDashboardPage />} />
        <Route path="landlord/properties" element={<PropertiesPage />} />
        <Route path="landlord/applications" element={<ApplicationsPage />} />
        <Route path="landlord/add-property" element={<AddPropertyPage />} />
        <Route path="rent-opportunities" element={<RentOpportunitiesPage />} />
        <Route path="find-property" element={<FindPropertyPage />} />
        <Route path="chats" element={<ChatsPage />} />
        <Route path="rent-savings" element={<RentSavingsPage />} />
        <Route path="legal-assistant" element={<LegalAssistantPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminHomePage />} />
        <Route path="admin/pages" element={<PagesPage />} />
        <Route path="admin/users" element={<UsersPage />} />
        <Route path="admin/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  console.log("App component rendering");
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
