
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RouteGuard } from "@/components/dashboard/RouteGuard";
import { RoleInitializer } from "@/components/dashboard/RoleInitializer";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";
import { RoommateRecommendations } from "@/components/dashboard/RoommateRecommendations";
import { GeminiChat } from "@/components/chat/GeminiChat";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function Dashboard() {
  const { role } = useRole();
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const assignedRole = user?.user_metadata?.role;

  useEffect(() => {
    console.log("📍 Dashboard - Current state:", {
      path: location.pathname,
      role: role,
      assignedRole: assignedRole,
      loading: loading
    });
  }, [location.pathname, role, assignedRole, loading]);

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
            assignedRole={assignedRole}
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

function DashboardContent({ role, assignedRole, location, showRoleDialog }: any) {
  // Only redirect if we're exactly at /dashboard root
  if (location.pathname === '/dashboard' && !showRoleDialog) {
    const effectiveRole = role || assignedRole;

    if (effectiveRole === 'landlord') {
      return <Navigate to="/dashboard/landlord" replace />;
    } else if (effectiveRole === 'developer') {
      return <Navigate to="/dashboard/landlord" replace />;
    } else if (effectiveRole === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (effectiveRole === 'renovator') {
      return <Navigate to="/renovator/dashboard" replace />;
    } else if (effectiveRole === 'mortgage_broker') {
      return <Navigate to="/dashboard/mortgage-broker" replace />;
    } else if (effectiveRole === 'seeker') {
      return (
        <DashboardLayout>
          <RoommateRecommendations />
        </DashboardLayout>
      );
    }
  }

  // For all other routes, show the layout with outlet
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
