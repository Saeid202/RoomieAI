import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { RoleProvider } from "@/contexts/RoleContext";
import Dashboard from "@/pages/Dashboard";
import HomePage from "@/pages/Home";
import AboutUs from "./pages/AboutUs";
import FAQPage from "./pages/FAQ";
import SafetyCenter from "./pages/SafetyCenter";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import ContactUsPage from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RoommateRecommendationsPage from "@/pages/dashboard/RoommateRecommendations";
import RentalOptionsPage from "@/pages/dashboard/RentalOptions";
import PlanAheadMatchingPage from "@/pages/dashboard/PlanAheadMatching";
import OppositeSchedulePage from "@/pages/dashboard/OppositeSchedule";
import WorkExchangePage from "@/pages/dashboard/WorkExchange";
import LGBTQMatchingPage from "@/pages/dashboard/LGBTQMatching";
import LandlordDashboardPage from "@/pages/dashboard/landlord/LandlordDashboard";
import PropertiesPage from "@/pages/dashboard/landlord/Properties";
import ApplicationsPage from "@/pages/dashboard/landlord/Applications";
import AddPropertyPage from "@/pages/dashboard/landlord/AddProperty";
import ContractReviewPage from "@/pages/dashboard/landlord/ContractReview";
import FindPropertyPage from "@/pages/dashboard/FindProperty";
import AuthPage from "@/pages/Auth";
import Callback from "@/pages/auth/Callback";
import { ErrorBoundary } from "@/components/utility/ErrorBoundary";
import PropertyDetailsPage from "@/pages/dashboard/PropertyDetails";
import RentalApplicationPage from "@/pages/dashboard/RentalApplication";
import LegalAssistantPage from "@/pages/dashboard/LegalAssistant";
import LegalAIPage from "@/pages/dashboard/LegalAI";
import TenancyLegalAIPage from "@/pages/dashboard/TenancyLegalAI";
import PropertyCompliancePage from "@/pages/dashboard/PropertyCompliance";
import EvictionAssistantPage from "@/pages/dashboard/EvictionAssistant";
import N4FormPage from "@/pages/dashboard/forms/N4FormPage";
import N5FormPage from "@/pages/dashboard/forms/N5FormPage";
import N8FormPage from "@/pages/dashboard/forms/N8FormPage";
import N12FormPage from "@/pages/dashboard/forms/N12FormPage";
import N13FormPage from "@/pages/dashboard/forms/N13FormPage";
import A2FormPage from "@/pages/dashboard/forms/A2FormPage";
import RenovatorsPage from "@/pages/dashboard/Renovators";
import CleanersPage from "@/pages/dashboard/Cleaners";
import ShopPage from "@/pages/dashboard/Shop";
import DigitalWalletPage from "@/pages/dashboard/DigitalWallet";
import AutoPayPage from "@/pages/dashboard/AutoPay";
import LateFeeManagementPage from "@/pages/dashboard/LateFeeManagement";
import ListRoomPage from "@/pages/dashboard/ListRoom";
import RentOpportunitiesPage from "@/pages/dashboard/RentOpportunities";
import ChatsPage from "@/pages/dashboard/Chats";
import RentSavingsPage from "@/pages/dashboard/RentSavings";
import TailorAIPage from "@/pages/dashboard/TailorAI";
import LeaseContractPage from "@/pages/dashboard/LeaseContract";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import AdminLoginPage from "@/pages/admin/AdminLogin";
import AdminHomePage from "@/pages/dashboard/admin/AdminHome";
import PagesPage from "@/pages/dashboard/admin/Pages";
import UsersPage from "@/pages/dashboard/admin/Users";
import RenovationPartnersPage from "@/pages/dashboard/admin/RenovationPartners";
import AdminCleanersPage from "@/pages/dashboard/admin/Cleaners";
import SettingsPage from "@/pages/dashboard/Settings";
import MatchesPage from "@/pages/dashboard/Matches";
import MyApplicationsPage from "@/pages/dashboard/MyApplications";
import ApplicationOverviewPage from "@/pages/dashboard/ApplicationOverview";
import EmergencyMode from "@/pages/dashboard/EmergencyMode";
import EmergencyAccept from "@/pages/EmergencyAccept";
import RenovatorDashboard from "@/pages/renovator/RenovatorDashboard";
import EmergencyInbox from "@/pages/renovator/EmergencyInbox";
import JobManager from "@/pages/renovator/JobManager";
import Messages from "@/pages/renovator/Messages";
import RenovatorProfile from "@/pages/renovator/RenovatorProfile";
import Availability from "@/pages/renovator/Availability";
import ServiceArea from "@/pages/renovator/ServiceArea";
import RenovatorSettings from "@/pages/renovator/RenovatorSettings";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

function AppRoutes() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect from root to dashboard
  if (user) {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/safety-center" element={<SafetyCenter />} />
        <Route path="/community-guidelines" element={<CommunityGuidelines />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/emergency/accept/:token" element={<EmergencyAccept />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route path="matches" element={<MatchesPage />} />
          <Route path="roommate-recommendations" element={<RoommateRecommendationsPage />} />
          <Route path="rental-options" element={<ErrorBoundary componentName="RentalOptionsPage"><RentalOptionsPage /></ErrorBoundary>} />
          <Route path="rental-options/:id" element={<ErrorBoundary componentName="PropertyDetailsPage"><PropertyDetailsPage /></ErrorBoundary>} />
          <Route path="rental-application/:id" element={<ErrorBoundary componentName="RentalApplicationPage"><RentalApplicationPage /></ErrorBoundary>} />
          <Route path="application-overview/:applicationId" element={<ApplicationOverviewPage />} />
          <Route path="plan-ahead-matching" element={<PlanAheadMatchingPage />} />
          <Route path="applications" element={<ErrorBoundary componentName="MyApplicationsPage"><MyApplicationsPage /></ErrorBoundary>} />
          <Route path="opposite-schedule" element={<OppositeSchedulePage />} />
          <Route path="work-exchange" element={<WorkExchangePage />} />
          <Route path="lgbtq-matching" element={<LGBTQMatchingPage />} />
          <Route path="landlord" element={<LandlordDashboardPage />} />
          <Route path="landlord/properties" element={<PropertiesPage />} />
          <Route path="landlord/applications" element={<ApplicationsPage />} />
          <Route path="landlord/add-property" element={<AddPropertyPage />} />
          <Route path="landlord/contracts" element={<ContractReviewPage />} />
          <Route path="rent-opportunities" element={<RentOpportunitiesPage />} />
          <Route path="find-property" element={<FindPropertyPage />} />
          <Route path="contracts/:applicationId" element={<LeaseContractPage />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="tailor-ai" element={<TailorAIPage />} />
          <Route path="rent-savings" element={<RentSavingsPage />} />
          <Route path="legal-assistant" element={<LegalAssistantPage />} />
          <Route path="legal-ai" element={<LegalAIPage />} />
          <Route path="property-compliance-ai" element={<ErrorBoundary componentName="PropertyCompliancePage"><PropertyCompliancePage /></ErrorBoundary>} />
          <Route path="eviction-assistant" element={<ErrorBoundary componentName="EvictionAssistantPage"><EvictionAssistantPage /></ErrorBoundary>} />
          <Route path="forms/n4" element={<ErrorBoundary componentName="N4FormPage"><N4FormPage /></ErrorBoundary>} />
          <Route path="forms/n5" element={<ErrorBoundary componentName="N5FormPage"><N5FormPage /></ErrorBoundary>} />
          <Route path="forms/n8" element={<ErrorBoundary componentName="N8FormPage"><N8FormPage /></ErrorBoundary>} />
          <Route path="forms/n12" element={<ErrorBoundary componentName="N12FormPage"><N12FormPage /></ErrorBoundary>} />
          <Route path="forms/n13" element={<ErrorBoundary componentName="N13FormPage"><N13FormPage /></ErrorBoundary>} />
          <Route path="forms/a2" element={<ErrorBoundary componentName="A2FormPage"><A2FormPage /></ErrorBoundary>} />
          <Route path="tenancy-legal-ai" element={<TenancyLegalAIPage />} />
          <Route path="renovators" element={<RenovatorsPage />} />
          <Route path="emergency" element={<EmergencyMode />} />
          <Route path="cleaners" element={<CleanersPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="digital-wallet" element={<DigitalWalletPage />} />
          <Route path="autopay" element={<AutoPayPage />} />
          <Route path="late-fees" element={<LateFeeManagementPage />} />
          <Route path="list-room" element={<ListRoomPage />} />
          <Route path="profile" element={<Navigate to="/dashboard/roommate-recommendations" replace />} />
          <Route path="profile/*" element={<Navigate to="/dashboard/roommate-recommendations" replace />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Admin routes - protected with AdminRoute */}
          <Route path="admin" element={<AdminRoute><AdminHomePage /></AdminRoute>} />
          <Route path="admin/pages" element={<AdminRoute><PagesPage /></AdminRoute>} />
          <Route path="admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="admin/renovation-partners" element={<AdminRoute><RenovationPartnersPage /></AdminRoute>} />
          <Route path="admin/cleaners" element={<AdminRoute><AdminCleanersPage /></AdminRoute>} />
          <Route path="admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
        </Route>

        {/* Renovator Portal Routes */}
        <Route path="/renovator" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ErrorBoundary componentName="RenovatorDashboard"><RenovatorDashboard /></ErrorBoundary>} />
          <Route path="emergency" element={<EmergencyInbox />} />
          <Route path="jobs" element={<JobManager />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<RenovatorProfile />} />
          <Route path="availability" element={<Availability />} />
          <Route path="service-area" element={<ServiceArea />} />
          <Route path="settings" element={<RenovatorSettings />} />
        </Route>
      </Routes>
    );
  }

  // If user is not authenticated, show normal routes
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/safety-center" element={<SafetyCenter />} />
      <Route path="/community-guidelines" element={<CommunityGuidelines />} />
      <Route path="/contact-us" element={<ContactUsPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<Callback />} />
      <Route path="/emergency/accept/:token" element={<EmergencyAccept />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }>
        <Route path="matches" element={<MatchesPage />} />
        <Route path="roommate-recommendations" element={<RoommateRecommendationsPage />} />
        <Route path="rental-options" element={<ErrorBoundary componentName="RentalOptionsPage"><RentalOptionsPage /></ErrorBoundary>} />
        <Route path="rental-options/:id" element={<ErrorBoundary componentName="PropertyDetailsPage"><PropertyDetailsPage /></ErrorBoundary>} />
        <Route path="rental-application/:id" element={<ErrorBoundary componentName="RentalApplicationPage"><RentalApplicationPage /></ErrorBoundary>} />
        <Route path="application-overview/:applicationId" element={<ApplicationOverviewPage />} />
        <Route path="plan-ahead-matching" element={<PlanAheadMatchingPage />} />
        <Route path="applications" element={<ErrorBoundary componentName="MyApplicationsPage"><MyApplicationsPage /></ErrorBoundary>} />
        <Route path="opposite-schedule" element={<OppositeSchedulePage />} />
        <Route path="work-exchange" element={<WorkExchangePage />} />
        <Route path="lgbtq-matching" element={<LGBTQMatchingPage />} />
        <Route path="landlord" element={<LandlordDashboardPage />} />
        <Route path="landlord/properties" element={<PropertiesPage />} />
        <Route path="landlord/applications" element={<ApplicationsPage />} />
        <Route path="landlord/add-property" element={<AddPropertyPage />} />
        <Route path="rent-opportunities" element={<RentOpportunitiesPage />} />
        <Route path="find-property" element={<FindPropertyPage />} />
        <Route path="chats" element={<ChatsPage />} />
        <Route path="tailor-ai" element={<TailorAIPage />} />
        <Route path="rent-savings" element={<RentSavingsPage />} />
        <Route path="legal-assistant" element={<LegalAssistantPage />} />
        <Route path="legal-ai" element={<LegalAIPage />} />
        <Route path="property-compliance-ai" element={<ErrorBoundary componentName="PropertyCompliancePage"><PropertyCompliancePage /></ErrorBoundary>} />
        <Route path="tenancy-legal-ai" element={<TenancyLegalAIPage />} />
        <Route path="renovators" element={<RenovatorsPage />} />
        <Route path="cleaners" element={<CleanersPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="digital-wallet" element={<DigitalWalletPage />} />
        <Route path="autopay" element={<AutoPayPage />} />
        <Route path="late-fees" element={<LateFeeManagementPage />} />
        <Route path="list-room" element={<ListRoomPage />} />
        <Route path="profile" element={<Navigate to="/dashboard/roommate-recommendations" replace />} />
        <Route path="profile/*" element={<Navigate to="/dashboard/roommate-recommendations" replace />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Admin routes - protected with AdminRoute */}
        <Route path="admin" element={<AdminRoute><AdminHomePage /></AdminRoute>} />
        <Route path="admin/pages" element={<AdminRoute><PagesPage /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="admin/renovation-partners" element={<AdminRoute><RenovationPartnersPage /></AdminRoute>} />
        <Route path="admin/cleaners" element={<AdminRoute><AdminCleanersPage /></AdminRoute>} />
        <Route path="admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
      </Route>

      {/* Renovator Portal Routes */}
      <Route path="/renovator" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ErrorBoundary componentName="RenovatorDashboard"><RenovatorDashboard /></ErrorBoundary>} />
        <Route path="emergency" element={<EmergencyInbox />} />
        <Route path="jobs" element={<JobManager />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<RenovatorProfile />} />
        <Route path="availability" element={<Availability />} />
        <Route path="service-area" element={<ServiceArea />} />
        <Route path="settings" element={<RenovatorSettings />} />
      </Route>
    </Routes>
  );
}

function App() {
  const path = useLocation().pathname;
  useEffect(() => {
    scrollTo(0, 0)
  }, [path]
  )

  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          <AppRoutes />
          <Toaster />
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
