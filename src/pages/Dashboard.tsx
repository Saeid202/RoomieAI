
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RouteGuard } from "@/components/dashboard/RouteGuard";
import { RoleInitializer } from "@/components/dashboard/RoleInitializer";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, useEffect, useState } from "react";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";
import { GeminiChat } from "@/components/chat/GeminiChat";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function Dashboard() {
  const { role } = useRole();
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  // State for the AI Chat dialog
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    console.log("📍 Dashboard - Current state:", {
      path: location.pathname,
      role: role,
      loading: loading
    });
  }, [location.pathname, role, loading]);

  // Show loading state only if auth is loading
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

  return (
    <>
      <RoleInitializer>
        <RouteGuard>
          <DashboardContent 
            role={role}
            location={location}
            showRoleDialog={showRoleDialog}
          />
        </RouteGuard>
      </RoleInitializer>

      <RoleSelectionDialog
        isOpen={showRoleDialog}
        onClose={() => setShowRoleDialog(false)}
        showCloseButton={false}
      />

      {/* Floating AI Chat Button */}
      <Button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 z-40"
        title="Open AI Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* AI Chat Component */}
      <GeminiChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        systemPrompt="You are a helpful assistant for a real estate platform. Help users with questions about properties, rentals, applications, and general real estate topics."
        title="AI Assistant"
        subtitle="Ask me anything about real estate!"
        placeholder="Ask about properties, rentals, applications..."
      />
    </>
  );
}

function DashboardContent({ role, location, showRoleDialog }: any) {
  // Only redirect if we're exactly at /dashboard root
  if (location.pathname === '/dashboard' && !showRoleDialog) {
    // If role is still loading, show a spinner instead of blank screen
    if (!role) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (role === 'landlord' || role === 'developer') {
      return <Navigate to="/dashboard/landlord" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (role === 'renovator') {
      return <Navigate to="/renovator/dashboard" replace />;
    } else if (role === 'mortgage_broker') {
      return <Navigate to="/dashboard/mortgage-broker" replace />;
    } else if (role === 'lawyer') {
      return <Navigate to="/dashboard/lawyer" replace />;
    } else if (role === 'lender') {
      return <Navigate to="/dashboard/lender" replace />;
    } else {
      // seeker or any unknown role → seeker dashboard
      return <Navigate to="/dashboard/roommate-recommendations" replace />;
    }
  }

    // For all other routes, show the layout with outlet
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </DashboardLayout>
  );
}
