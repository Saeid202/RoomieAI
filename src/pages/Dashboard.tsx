
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
    console.log("Dashboard mounted - current path:", location.pathname);
    console.log("Dashboard mounted - role:", role);
    console.log("Dashboard mounted - user:", user?.email);
    console.log("Dashboard mounted - loading:", loading);
    console.log("Dashboard mounted - assigned role:", assignedRole);

    // If user is logged in but has no role assigned, show the role selection dialog
    if (!loading && user && !assignedRole && location.pathname === '/dashboard') {
      console.log("No role assigned, showing role selection dialog");
      setShowRoleDialog(true);
    }
  }, [location.pathname, role, user, loading, assignedRole]);

  // Only redirect if we're exactly at /dashboard and not at a sub-route
  if (!loading && location.pathname === '/dashboard' && !showRoleDialog) {
    // Make sure we have routes for all these destinations
    if (assignedRole === 'landlord') {
      return <Navigate to="/dashboard/landlord" replace />;
    } else if (assignedRole === 'developer') {
      return <Navigate to="/dashboard/developer" replace />;
    } else if (assignedRole === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (assignedRole === 'renovator') {
      return <Navigate to="/renovator" replace />;
    } else if (assignedRole === 'seeker') {
      // Only seekers should see RoommateRecommendations at main /dashboard route
      return (
        <DashboardLayout>
          <RoommateRecommendations />
        </DashboardLayout>
      );
    } else {
      // Default fallback for any other role (shouldn't happen)
      return (
        <DashboardLayout>
          <RoommateRecommendations />
        </DashboardLayout>
      );
    }
  }

  // Additional redirect: if user is on /dashboard but role doesn't match the route, redirect to correct dashboard
  if (!loading && assignedRole && location.pathname.startsWith('/dashboard') && !showRoleDialog) {
    if (assignedRole === 'landlord' && location.pathname !== '/dashboard/landlord') {
      return <Navigate to="/dashboard/landlord" replace />;
    }
    if (assignedRole === 'admin' && location.pathname !== '/dashboard/admin') {
      return <Navigate to="/dashboard/admin" replace />;
    }
    if (assignedRole === 'renovator' && location.pathname !== '/renovator') {
      return <Navigate to="/renovator" replace />;
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
