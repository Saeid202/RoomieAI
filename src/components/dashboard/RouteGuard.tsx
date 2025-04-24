
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
    console.log("RouteGuard - Loading:", loading);
    console.log("RouteGuard - User:", user?.email);
    console.log("RouteGuard - Role:", role);
    console.log("RouteGuard - AssignedRole:", assignedRole);
    console.log("RouteGuard - Current path:", location.pathname);
    
    if (loading) {
      console.log("RouteGuard - Still loading, skipping checks");
      return;
    }
    
    if (!user) {
      console.log("RouteGuard - No user, redirecting to home");
      toast({
        title: "Authentication required",
        description: "Please log in to access the dashboard",
        variant: "destructive",
      });
      navigate('/', { replace: true });
      return;
    }
    
    // Check if we're on the exact dashboard route and need to redirect
    if (location.pathname === '/dashboard') {
      console.log("RouteGuard - On exact dashboard path, should redirect");
      if (assignedRole === 'landlord') {
        navigate('/dashboard/landlord', { replace: true });
      } else if (assignedRole === 'developer') {
        navigate('/dashboard/developer', { replace: true });
      } else {
        navigate('/dashboard/profile', { replace: true });
      }
    }
    
    console.log("RouteGuard - Checks complete, allowing access");
  }, [location.pathname, navigate, user, loading, role, assignedRole]);

  return <>{children}</>;
}
