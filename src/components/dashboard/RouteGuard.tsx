
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext"; 
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { role } = useRole();
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const assignedRole = user?.user_metadata?.role;
  
  useEffect(() => {
    if (loading) {
      console.log("RouteGuard - Loading state, skipping checks");
      return;
    }
    
    console.log("RouteGuard - Checking authentication and role");
    console.log("RouteGuard - User:", user?.email);
    console.log("RouteGuard - Role:", role);
    console.log("RouteGuard - Current path:", location.pathname);
    
    if (!user) {
      console.log("RouteGuard - No user, redirecting to home");
      navigate('/', { replace: true });
      return;
    }
    
    // For the profile page, allow access regardless of role
    if (location.pathname === '/dashboard/profile' || 
        location.pathname.startsWith('/dashboard/roommate-recommendations') ||
        location.pathname.startsWith('/dashboard/chats')) {
      console.log("RouteGuard - Allowing access to common pages");
      return;
    }
    
    // Specific role checks removed to allow users to access the basic dashboard
    
    console.log("RouteGuard - Checks complete, allowing access");
  }, [location.pathname, assignedRole, navigate, user, loading, role]);

  return <>{children}</>;
}
