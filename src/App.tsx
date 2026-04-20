import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { Suspense, lazy, useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { InstallPrompt } from "./components/PWA/InstallPrompt";
import { useAuth } from "./hooks/useAuth";


// Lazy load components for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const HomePage = lazy(() => import("./pages/Home"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const FAQPage = lazy(() => import("./pages/FAQ"));
const SafetyCenter = lazy(() => import("./pages/SafetyCenter"));
const CommunityGuidelines = lazy(() => import("./pages/CommunityGuidelines"));
const ContactUsPage = lazy(() => import("./pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
// Dashboard pages - lazy loaded
const RoommateRecommendationsPage = lazy(() => import("./pages/dashboard/RoommateRecommendations"));
const RentalOptionsPage = lazy(() => import("./pages/dashboard/RentalOptions"));
const PlanAheadMatchingPage = lazy(() => import("./pages/dashboard/PlanAheadMatching"));
const OppositeSchedulePage = lazy(() => import("./pages/dashboard/OppositeSchedule"));
const WorkExchangePage = lazy(() => import("./pages/dashboard/WorkExchange"));
const LGBTQMatchingPage = lazy(() => import("./pages/dashboard/LGBTQMatching"));
const IdealRoommatePage = lazy(() => import("./pages/dashboard/IdealRoommate"));

// Landlord pages - lazy loaded
const LandlordDashboardPage = lazy(() => import("./pages/dashboard/landlord/LandlordDashboard"));
const LandlordProfilePage = lazy(() => import("./pages/dashboard/landlord/Profile"));
const PropertiesPage = lazy(() => import("./pages/dashboard/landlord/PropertiesIntelligence"));
const ApplicationsPage = lazy(() => import("./pages/dashboard/landlord/Applications"));
const AddPropertyPage = lazy(() => import("./pages/dashboard/landlord/AddProperty"));
const ContractReviewPage = lazy(() => import("./pages/dashboard/landlord/ContractReview"));

// Common pages - lazy loaded
const FindPropertyPage = lazy(() => import("./pages/dashboard/FindProperty"));
const AuthPage = lazy(() => import("./pages/Auth"));
const Callback = lazy(() => import("./pages/auth/Callback"));
const PropertyDetailsPage = lazy(() => import("./pages/dashboard/PropertyDetails"));
const PropertyDocumentVault = lazy(() => import("./pages/dashboard/PropertyDocumentVault"));
const RentalApplicationPage = lazy(() => import("./pages/dashboard/RentalApplication"));

// Admin pages - lazy loaded
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLogin"));
const AdminHomePage = lazy(() => import("./pages/dashboard/admin/AdminHome"));
const PagesPage = lazy(() => import("./pages/dashboard/admin/Pages"));
const UsersPage = lazy(() => import("./pages/dashboard/admin/Users"));
const RenovationPartnersPage = lazy(() => import("./pages/dashboard/admin/RenovationPartners"));
const AdminCleanersPage = lazy(() => import("./pages/dashboard/admin/Cleaners"));
const AdminConstructionProducts = lazy(() => import("./pages/dashboard/admin/AdminConstructionProducts"));
const AdminConstructionSuppliers = lazy(() => import("./pages/dashboard/admin/AdminConstructionSuppliers"));
const AdminConstructionContent = lazy(() => import("./pages/dashboard/admin/AdminConstructionContent"));
const ReportingPreviewPage = lazy(() => import("./pages/dashboard/admin/ReportingPreview"));
const ReportingBatchesPage = lazy(() => import("./pages/dashboard/admin/ReportingBatches"));
const RateLimitManagementPage = lazy(() => import("./pages/dashboard/admin/RateLimitManagement"));
const AdminCommunities = lazy(() => import("./pages/dashboard/admin/AdminCommunities"));
const AdminWalletPage = lazy(() => import("./pages/dashboard/admin/AdminWallet"));
const SettingsPage = lazy(() => import("./pages/dashboard/Settings"));

// Components that need to be loaded immediately
import { ErrorBoundary } from "./components/utility/ErrorBoundary";
import { RenovatorLayout } from "./components/renovator/RenovatorLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
// Additional pages - lazy loaded
const DebugPropertiesPage = lazy(() => import("./pages/dashboard/DebugProperties"));
const MyApplicationsPage = lazy(() => import("./pages/dashboard/MyApplications"));
const ApplicationOverviewPage = lazy(() => import("./pages/dashboard/landlord/ApplicationOverview"));
const EmergencyMode = lazy(() => import("./pages/dashboard/EmergencyMode"));
const EmergencyAccept = lazy(() => import("./pages/EmergencyAccept"));

// Renovator pages - lazy loaded
const RenovatorDashboard = lazy(() => import("./pages/renovator/RenovatorDashboard"));
const PublicPropertyDetails = lazy(() => import("./pages/PublicPropertyDetails"));
const EmergencyInbox = lazy(() => import("./pages/renovator/EmergencyInbox"));
const JobManager = lazy(() => import("./pages/renovator/JobManager"));
const Messages = lazy(() => import("./pages/renovator/Messages"));
const RenovatorProfile = lazy(() => import("./pages/renovator/RenovatorProfile"));
const Availability = lazy(() => import("./pages/renovator/Availability"));
const ServiceArea = lazy(() => import("./pages/renovator/ServiceArea"));
const RenovatorSettings = lazy(() => import("./pages/renovator/RenovatorSettings"));
// More dashboard pages - lazy loaded
const EducationCentrePage = lazy(() => import("./pages/dashboard/EducationCentre"));
const BuyingOpportunitiesPage = lazy(() => import("./pages/dashboard/BuyingOpportunities"));
const MortgageConsentPage = lazy(() => import("./pages/dashboard/MortgageConsentPage"));
const MortgageSubmissionResults = lazy(() => import("./pages/dashboard/MortgageSubmissionResults"));
const CoOwnershipGuidePage = lazy(() => import("./pages/dashboard/CoOwnershipGuide"));
const TaxIntelligencePage = lazy(() => import("./pages/dashboard/TaxIntelligence"));
const SeekerProfilePage = lazy(() => import("./pages/dashboard/SeekerProfile"));
const PublicProfilePage = lazy(() => import("./pages/dashboard/PublicProfile"));
const RentOpportunitiesPage = lazy(() => import("./pages/dashboard/RentOpportunities"));
const ChatsPage = lazy(() => import("./pages/dashboard/Chats"));
const TailorAIPage = lazy(() => import("./pages/dashboard/TailorAI"));
const LegalAssistantPage = lazy(() => import("./pages/dashboard/LegalAssistant"));
const LegalAIPage = lazy(() => import("./pages/dashboard/LegalAI"));

// Form pages - lazy loaded
const PropertyCompliancePage = lazy(() => import("./pages/dashboard/forms/PropertyCompliance"));
const EvictionAssistantPage = lazy(() => import("./pages/dashboard/forms/EvictionAssistant"));
const N4FormPage = lazy(() => import("./pages/dashboard/forms/N4FormPage"));
const N5FormPage = lazy(() => import("./pages/dashboard/forms/N5FormPage"));
const N8FormPage = lazy(() => import("./pages/dashboard/forms/N8FormPage"));
const N12FormPage = lazy(() => import("./pages/dashboard/forms/N12FormPage"));
const N13FormPage = lazy(() => import("./pages/dashboard/forms/N13FormPage"));
const A2FormPage = lazy(() => import("./pages/dashboard/forms/A2FormPage"));
const T2FormPage = lazy(() => import("./pages/dashboard/forms/T2FormPage"));
const T6FormPage = lazy(() => import("./pages/dashboard/forms/T6FormPage"));
const T1FormPage = lazy(() => import("./pages/dashboard/forms/T1FormPage"));
const T3FormPage = lazy(() => import("./pages/dashboard/forms/T3FormPage"));
const T5FormPage = lazy(() => import("./pages/dashboard/forms/T5FormPage"));
const TenancyLegalAIPage = lazy(() => import("./pages/dashboard/forms/TenancyLegalAI"));

// Service pages - lazy loaded
const RenovatorsPage = lazy(() => import("./pages/dashboard/Renovators"));
const CleanersPage = lazy(() => import("./pages/dashboard/Cleaners"));
const ShopPage = lazy(() => import("./pages/dashboard/Shop"));
const TenantPaymentsPage = lazy(() => import("./pages/dashboard/tenant/TenantPayments"));
const WalletPage = lazy(() => import("./pages/dashboard/Wallet"));
const LandlordPaymentsPage = lazy(() => import("./pages/dashboard/landlord/LandlordPayments"));
const PayoutSetupPage = lazy(() => import("./pages/dashboard/landlord/PayoutSetup"));
const ViewingAppointmentsPage = lazy(() => import("./pages/dashboard/landlord/ViewingAppointments"));
const AIScreeningSettingsPage = lazy(() => import("./pages/dashboard/landlord/AIScreeningSettingsPage"));
const PADPaymentTest = lazy(() => import("./pages/dashboard/PADPaymentTest"));
const ListRoomPage = lazy(() => import("./pages/dashboard/ListRoom"));
const LeaseContractPage = lazy(() => import("./pages/dashboard/LeaseContract"));
const AIChat = lazy(() => import("./pages/dashboard/AIChat"));

// Mortgage broker pages - lazy loaded
const MortgageBrokerDashboard = lazy(() => import("./pages/dashboard/MortgageBrokerDashboard"));
const MortgageBrokerProfile = lazy(() => import("./pages/dashboard/MortgageBrokerProfile"));
const MortgageBrokerClients = lazy(() => import("./pages/dashboard/MortgageBrokerClients"));
const LawyerDashboard = lazy(() => import("./pages/dashboard/LawyerDashboard"));
const LawyerProfile = lazy(() => import("./pages/dashboard/LawyerProfile"));
const LawyerClients = lazy(() => import("./pages/dashboard/LawyerClients"));
const LawyerDocuments = lazy(() => import("./pages/dashboard/LawyerDocuments"));
const LawyerDocumentReviews = lazy(() => import("./pages/dashboard/LawyerDocumentReviews"));
const FindLawyer = lazy(() => import("./pages/dashboard/FindLawyer"));
const LenderDashboard = lazy(() => import("./pages/dashboard/lender/LenderDashboard"));
const LenderProfile = lazy(() => import("./pages/dashboard/lender/LenderProfile"));
const LenderRates = lazy(() => import("./pages/dashboard/lender/LenderRates"));
const LenderRequests = lazy(() => import("./pages/dashboard/lender/LenderRequests"));
const CoBuyingScenario = lazy(() => import("./pages/dashboard/CoBuyingScenario"));
const CoOwnershipProfile = lazy(() => import("./pages/dashboard/CoOwnershipProfile"));
const ConstructionLogin = lazy(() => import("./construction/pages/ConstructionLogin"));
const ConstructionSignup = lazy(() => import("./construction/pages/ConstructionSignup"));
const ConstructionDashboardHome = lazy(() => import("./construction/pages/dashboard/ConstructionDashboardHome"));

const ConstructionProducts = lazy(() => import("./construction/pages/dashboard/ConstructionProducts"));
const ConstructionProductNew = lazy(() => import("./construction/pages/dashboard/ConstructionProductNew"));
const ConstructionProductEdit = lazy(() => import("./construction/pages/dashboard/ConstructionProductEdit"));
const ConstructionColorPatternTest = lazy(() => import("./construction/pages/dashboard/ColorPatternTestPage"));
const ConstructionProfile = lazy(() => import("./construction/pages/dashboard/ConstructionProfile"));
const ConstructionQuotes = lazy(() => import("./construction/pages/dashboard/ConstructionQuotes"));
const ConstructionQuoteDetail = lazy(() => import("./construction/pages/dashboard/ConstructionQuoteDetail"));
const ConstructionMessages = lazy(() => import("./construction/pages/dashboard/ConstructionMessages"));
const ConstructionMessageDetail = lazy(() => import("./construction/pages/dashboard/ConstructionMessageDetail"));
const ConstructionProductDetail = lazy(() => import("./construction/pages/ConstructionProductDetail"));
const ConstructionPublicProducts = lazy(() => import("./construction/pages/ConstructionPublicProducts"));
const ConstructionCustomOrder = lazy(() => import("./construction/pages/ConstructionCustomOrder"));
const CommunitiesPage = lazy(() => import("./pages/dashboard/Communities"));
const CommunityDetailPage = lazy(() => import("./pages/dashboard/CommunityDetail"));


// Reusable Suspense wrapper for better performance
const SuspenseWrapper = ({ children }: { children: any }) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    {children}
  </Suspense>
)

function AppRoutes() {
  const { user, loading } = useAuth();

  // Show optimized loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Loading Homie AI...</p>
        </div>
      </div>
    );
  }

  return (

      <Routes>
        <Route path="/" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <HomePage />
          </Suspense>
        } />
        <Route path="/about-us" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <AboutUs />
          </Suspense>
        } />
        <Route path="/faq" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <FAQPage />
          </Suspense>
        } />
        <Route path="/safety-center" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <SafetyCenter />
          </Suspense>
        } />
        <Route path="/community-guidelines" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <CommunityGuidelines />
          </Suspense>
        } />
        <Route path="/contact-us" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <ContactUsPage />
          </Suspense>
        } />
        <Route path="/privacy-policy" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <PrivacyPolicy />
          </Suspense>
        } />
        <Route path="/admin/login" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <AdminLoginPage />
          </Suspense>
        } />
        <Route path="/auth" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <AuthPage />
          </Suspense>
        } />
        <Route path="/auth/login" element={<Navigate to="/auth" replace />} />
        <Route path="/auth/callback" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <Callback />
          </Suspense>
        } />
        <Route path="/emergency/accept/:token" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <EmergencyAccept />
          </Suspense>
        } />
        <Route path="/property/:id" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <PublicPropertyDetails />
          </Suspense>
        } />

        {/* Construction Routes — accessible regardless of HomieAI auth state */}
        <Route path="/construction" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <ConstructionPublicProducts />
          </Suspense>
        } />
        
        {/* Handle construction without leading slash */}
        <Route path="construction" element={<Navigate to="/construction" replace />} />
        <Route path="/construction/custom" element={<SuspenseWrapper><ConstructionCustomOrder /></SuspenseWrapper>} />
        <Route path="/construction/login" element={<SuspenseWrapper><ConstructionLogin /></SuspenseWrapper>} />
        <Route path="/construction/signup" element={<SuspenseWrapper><ConstructionSignup /></SuspenseWrapper>} />
        <Route path="/construction/dashboard" element={<SuspenseWrapper><ConstructionDashboardHome /></SuspenseWrapper>} />
        <Route path="/construction/dashboard/products" element={<SuspenseWrapper><ConstructionProducts /></SuspenseWrapper>} />
        <Route path="/construction/dashboard/products/new" element={<SuspenseWrapper><ConstructionProductNew /></SuspenseWrapper>} />
        <Route path="/construction/dashboard/products/:id/edit" element={<SuspenseWrapper><ConstructionProductEdit /></SuspenseWrapper>} />
        <Route path="/construction/dashboard/profile" element={<SuspenseWrapper><ConstructionProfile /></SuspenseWrapper>} />
        <Route path="/construction/dashboard/quotes" element={<SuspenseWrapper><ConstructionQuotes /></SuspenseWrapper>} />
        <Route path="/construction/dashboard/quotes/:id" element={<SuspenseWrapper><ConstructionQuoteDetail /></SuspenseWrapper>} />
        <Route path="/construction/dashboard/messages" element={<SuspenseWrapper><ConstructionMessages /></SuspenseWrapper>} />
        <Route path="/construction/dashboard/messages/:id" element={<SuspenseWrapper><ConstructionMessageDetail /></SuspenseWrapper>} />
        <Route path="/construction/:slug" element={<SuspenseWrapper><ConstructionProductDetail /></SuspenseWrapper>} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          {/* Seeker Profile & Core */}
          <Route path="profile" element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading profile...</div>}>
            <SeekerProfilePage />
          </Suspense>
        } />
          <Route path="user/:userId" element={<PublicProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="ai-chat" element={<AIChat />} />
          
          {/* Matching & Discovery */}
          <Route path="roommate-recommendations" element={<RoommateRecommendationsPage />} />
          <Route path="ideal-roommate" element={<IdealRoommatePage />} />
          <Route path="plan-ahead-matching" element={<PlanAheadMatchingPage />} />
          <Route path="opposite-schedule" element={<OppositeSchedulePage />} />
          <Route path="work-exchange" element={<WorkExchangePage />} />
          <Route path="lgbtq-matching" element={<LGBTQMatchingPage />} />
          
          {/* Property Search & Applications */}
          <Route path="rental-options" element={<ErrorBoundary componentName="RentalOptionsPage"><RentalOptionsPage /></ErrorBoundary>} />
          <Route path="find-property" element={<FindPropertyPage />} />
          <Route path="rent-opportunities" element={<RentOpportunitiesPage />} />
          <Route path="buying-opportunities" element={<BuyingOpportunitiesPage />} />
          <Route path="applications" element={<ErrorBoundary componentName="MyApplicationsPage"><MyApplicationsPage /></ErrorBoundary>} />
          <Route path="rental-application/:id" element={<ErrorBoundary componentName="RentalApplicationPage"><RentalApplicationPage /></ErrorBoundary>} />
          <Route path="application-overview/:applicationId" element={<ApplicationOverviewPage />} />
          
          {/* Property Details */}
          <Route path="debug-properties" element={<DebugPropertiesPage />} />
          <Route path="rent/:id" element={<ErrorBoundary componentName="PropertyDetailsPage"><PropertyDetailsPage /></ErrorBoundary>} />
          <Route path="buy/:id" element={<ErrorBoundary componentName="PropertyDetailsPage"><PropertyDetailsPage /></ErrorBoundary>} />
          <Route path="co-ownership/:id" element={<ErrorBoundary componentName="PropertyDetailsPage"><PropertyDetailsPage /></ErrorBoundary>} />
          <Route path="property/:id/documents" element={<ErrorBoundary componentName="PropertyDocumentVault"><PropertyDocumentVault /></ErrorBoundary>} />
          <Route path="property-documents/:id" element={<ErrorBoundary componentName="PropertyDocumentVault"><PropertyDocumentVault /></ErrorBoundary>} />
          
          {/* Financial Tools */}
          <Route path="mortgage-consent" element={<MortgageConsentPage />} />
          <Route path="mortgage-results" element={<MortgageSubmissionResults />} />
          <Route path="co-buying-scenario" element={<CoBuyingScenario />} />
          <Route path="co-ownership-profile" element={<CoOwnershipProfile />} />
          <Route path="tax-intelligence" element={<ErrorBoundary componentName="TaxIntelligencePage"><TaxIntelligencePage /></ErrorBoundary>} />
          
          {/* Communication */}
          <Route path="chats" element={<ChatsPage />} />
          
          {/* AI Tools */}
          <Route path="tailor-ai" element={<TailorAIPage />} />
          <Route path="legal-assistant" element={<LegalAssistantPage />} />
          <Route path="legal-ai" element={<LegalAIPage />} />
          <Route path="tenancy-legal-ai" element={<TenancyLegalAIPage />} />
          
          {/* Forms & Legal */}
          <Route path="property-compliance-ai" element={<ErrorBoundary componentName="PropertyCompliancePage"><PropertyCompliancePage /></ErrorBoundary>} />
          <Route path="eviction-assistant" element={<ErrorBoundary componentName="EvictionAssistantPage"><EvictionAssistantPage /></ErrorBoundary>} />
          <Route path="forms/n4" element={<ErrorBoundary componentName="N4FormPage"><N4FormPage /></ErrorBoundary>} />
          <Route path="forms/n5" element={<ErrorBoundary componentName="N5FormPage"><N5FormPage /></ErrorBoundary>} />
          <Route path="forms/n8" element={<ErrorBoundary componentName="N8FormPage"><N8FormPage /></ErrorBoundary>} />
          <Route path="forms/n12" element={<ErrorBoundary componentName="N12FormPage"><N12FormPage /></ErrorBoundary>} />
          <Route path="forms/n13" element={<ErrorBoundary componentName="N13FormPage"><N13FormPage /></ErrorBoundary>} />
          <Route path="forms/a2" element={<ErrorBoundary componentName="A2FormPage"><A2FormPage /></ErrorBoundary>} />
          <Route path="forms/t2" element={<ErrorBoundary componentName="T2FormPage"><T2FormPage /></ErrorBoundary>} />
          <Route path="forms/t6" element={<ErrorBoundary componentName="T6FormPage"><T6FormPage /></ErrorBoundary>} />
          <Route path="forms/t1" element={<ErrorBoundary componentName="T1FormPage"><T1FormPage /></ErrorBoundary>} />
          <Route path="forms/t3" element={<ErrorBoundary componentName="T3FormPage"><T3FormPage /></ErrorBoundary>} />
          <Route path="forms/t5" element={<ErrorBoundary componentName="T5FormPage"><T5FormPage /></ErrorBoundary>} />
          
          {/* Services & Tools */}
          <Route path="education-centre" element={<EducationCentrePage />} />
          <Route path="renovators" element={<RenovatorsPage />} />
          <Route path="cleaners" element={<CleanersPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="digital-wallet" element={<WalletPage />} />
          <Route path="pad-test" element={<PADPaymentTest />} />
          <Route path="list-room" element={<ListRoomPage />} />
          <Route path="emergency" element={<EmergencyMode />} />
          <Route path="emergency/:jobId" element={<EmergencyMode />} />
          
          {/* Community */}
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="communities/:id" element={<CommunityDetailPage />} />
          
          {/* Landlord Routes */}
          <Route path="landlord" element={<LandlordDashboardPage />} />
          <Route path="landlord/properties" element={<PropertiesPage />} />
          <Route path="landlord/applications" element={<ApplicationsPage />} />
          <Route path="landlord/viewing-appointments" element={<ViewingAppointmentsPage />} />
          <Route path="landlord/payments" element={<LandlordPaymentsPage />} />
          <Route path="landlord/payout-setup" element={<PayoutSetupPage />} />
          <Route path="landlord/profile" element={<LandlordProfilePage />} />
          <Route path="landlord/add-property" element={<AddPropertyPage />} />
          <Route path="landlord/contracts" element={<ContractReviewPage />} />
          <Route path="landlord/ai-screening" element={<AIScreeningSettingsPage />} />
          <Route path="contracts/:applicationId" element={<LeaseContractPage />} />

          {/* Mortgage Broker routes */}
          <Route path="mortgage-broker" element={<MortgageBrokerDashboard />} />
          <Route path="mortgage-broker/profile" element={<MortgageBrokerProfile />} />
          <Route path="mortgage-broker/clients" element={<MortgageBrokerClients />} />

          {/* Lawyer routes */}
          <Route path="lawyer" element={<LawyerDashboard />} />
          <Route path="lawyer/profile" element={<LawyerProfile />} />
          <Route path="lawyer/clients" element={<LawyerClients />} />
          <Route path="lawyer/documents" element={<LawyerDocuments />} />
          <Route path="lawyer-document-reviews" element={<LawyerDocumentReviews />} />
          <Route path="find-lawyer" element={<FindLawyer />} />

          {/* Lender routes */}
          <Route path="lender" element={<ErrorBoundary componentName="LenderDashboard"><LenderDashboard /></ErrorBoundary>} />
          <Route path="lender/profile" element={<ErrorBoundary componentName="LenderProfile"><LenderProfile /></ErrorBoundary>} />
          <Route path="lender/rates" element={<ErrorBoundary componentName="LenderRates"><LenderRates /></ErrorBoundary>} />
          <Route path="lender/requests" element={<ErrorBoundary componentName="LenderRequests"><LenderRequests /></ErrorBoundary>} />

          {/* Admin routes - protected with AdminRoute */}
          <Route path="admin" element={<AdminRoute><AdminHomePage /></AdminRoute>} />
          <Route path="admin/pages" element={<AdminRoute><PagesPage /></AdminRoute>} />
          <Route path="admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="admin/renovation-partners" element={<AdminRoute><RenovationPartnersPage /></AdminRoute>} />
          <Route path="admin/cleaners" element={<AdminRoute><AdminCleanersPage /></AdminRoute>} />
          <Route path="admin/construction" element={<AdminRoute><AdminConstructionProducts /></AdminRoute>} />
          <Route path="admin/construction/suppliers" element={<AdminRoute><AdminConstructionSuppliers /></AdminRoute>} />
          <Route path="admin/construction/content" element={<AdminRoute><AdminConstructionContent /></AdminRoute>} />
          <Route path="admin/reporting" element={<AdminRoute><ReportingPreviewPage /></AdminRoute>} />
          <Route path="admin/reporting-batches" element={<AdminRoute><ReportingBatchesPage /></AdminRoute>} />
          <Route path="admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          <Route path="admin/rate-limits" element={<AdminRoute><RateLimitManagementPage /></AdminRoute>} />
          <Route path="admin/communities" element={<AdminRoute><AdminCommunities /></AdminRoute>} />
          <Route path="admin/wallet" element={<AdminRoute><AdminWalletPage /></AdminRoute>} />

          {/* Community routes */}
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="communities/:id" element={<CommunityDetailPage />} />
        </Route>

        {/* Renovator Portal Routes */}
        <Route path="/renovator" element={
          <ProtectedRoute>
            <RenovatorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ErrorBoundary componentName="RenovatorDashboard"><RenovatorDashboard /></ErrorBoundary>} />
          <Route path="emergency" element={<EmergencyInbox />} />
          <Route path="jobs" element={<JobManager />} />
          <Route path="jobs/:jobId" element={<JobManager />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<RenovatorProfile />} />
          <Route path="availability" element={<Availability />} />
          <Route path="service-area" element={<ServiceArea />} />
          <Route path="tax-intelligence" element={<ErrorBoundary componentName="TaxIntelligencePage"><TaxIntelligencePage /></ErrorBoundary>} />
          <Route path="settings" element={<RenovatorSettings />} />
        </Route>

      </Routes>
    );
}

function App() {
  const path = useLocation().pathname;
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [path]);

  return (
    <>
      <InstallPrompt />
      <AppRoutes />
      <Toaster />
    </>
  );
}

export default App;
