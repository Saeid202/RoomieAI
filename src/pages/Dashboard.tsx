
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RouteGuard } from "@/components/dashboard/RouteGuard";
import { RoleInitializer } from "@/components/dashboard/RoleInitializer";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Dashboard() {
  const { role } = useRole();
  const { user, loading } = useAuth();
  const location = useLocation();
  
  const assignedRole = user?.user_metadata?.role;
  
  useEffect(() => {
    console.log("Dashboard mounted - current path:", location.pathname);
    console.log("Dashboard mounted - role:", role);
    console.log("Dashboard mounted - user:", user?.email);
    console.log("Dashboard mounted - loading:", loading);
    console.log("Dashboard mounted - assigned role:", assignedRole);
  }, [location.pathname, role, user, loading, assignedRole]);
  
  // Only redirect if we're exactly at /dashboard and not at a sub-route
  if (!loading && location.pathname === '/dashboard') {
    // Make sure we have routes for all these destinations
    if (assignedRole === 'landlord') {
      return <Navigate to="/dashboard/profile" replace />;
    } else if (assignedRole === 'developer') {
      return <Navigate to="/dashboard/profile" replace />;
    } else {
      // Default to profile for seeker role or no role
      return <Navigate to="/dashboard/profile" replace />;
    }
  }
  
  return (
    <RoleInitializer>
      <RouteGuard>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </RouteGuard>
    </RoleInitializer>
  );
}
