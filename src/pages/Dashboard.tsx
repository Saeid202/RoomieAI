
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RouteGuard } from "@/components/dashboard/RouteGuard";
import { RoleInitializer } from "@/components/dashboard/RoleInitializer";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";
import { RoommateRecommendations } from "@/components/dashboard/RoommateRecommendations";

export default function Dashboard() {
  const { role } = useRole();
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const assignedRole = user?.user_metadata?.role;

  useEffect(() => {
    // Only log once when path changes
    console.log("Dashboard - path:", location.pathname, "role:", assignedRole);
  }, [location.pathname]);

  // Show loading state
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

  // Only redirect if we're exactly at /dashboard and not at a sub-route
  if (location.pathname === '/dashboard' && !showRoleDialog) {
    if (assignedRole === 'landlord') {
      return <Navigate to="/dashboard/landlord" replace />;
    } else if (assignedRole === 'developer') {
      return <Navigate to="/dashboard/developer" replace />;
    } else if (assignedRole === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (assignedRole === 'renovator') {
      return <Navigate to="/renovator/dashboard" replace />;
    } else if (assignedRole === 'seeker') {
      return (
        <DashboardLayout>
          <RoommateRecommendations />
        </DashboardLayout>
      );
    }
  }

  // If we're at the root dashboard page and not redirecting elsewhere, show the Roomie AI introduction
  const showDashboardContent = location.pathname === '/dashboard' && !showRoleDialog;

  return (
    <>
      <RoleInitializer>
        <RouteGuard>
          <DashboardLayout>
            {showDashboardContent ? (
              <RoommateRecommendations />
            ) : (
              <Outlet />
            )}
          </DashboardLayout>
        </RouteGuard>
      </RoleInitializer>

      <RoleSelectionDialog
        isOpen={showRoleDialog}
        onClose={() => setShowRoleDialog(false)}
        showCloseButton={false}
      />
    </>
  );
}
