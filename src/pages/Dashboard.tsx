
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RouteGuard } from "@/components/dashboard/RouteGuard";
import { RoleInitializer } from "@/components/dashboard/RoleInitializer";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { role } = useRole();
  const { user } = useAuth();
  const location = useLocation();
  
  const assignedRole = user?.user_metadata?.role;
  
  if (location.pathname === '/dashboard') {
    if (assignedRole === 'landlord') {
      return <Navigate to="/dashboard/landlord" replace />;
    } else if (assignedRole === 'developer') {
      return <Navigate to="/dashboard/developer" replace />;
    } else {
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
