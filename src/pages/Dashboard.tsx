
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RouteGuard } from "@/components/dashboard/RouteGuard";
import { RoleInitializer } from "@/components/dashboard/RoleInitializer";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";

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
    } else if (assignedRole === 'seeker' || !assignedRole) {
      // Default to roommate-recommendations for seeker role or no role
      return <Navigate to="/dashboard/roommate-recommendations" replace />;
    }
  }
  
  return (
    <>
      <RoleInitializer>
        <RouteGuard>
          <DashboardLayout>
            <Outlet />
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
