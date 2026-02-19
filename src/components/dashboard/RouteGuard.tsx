
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext"; 
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const assignedRole = user?.user_metadata?.role;
  
  useEffect(() => {
    if (loading || !user) return;
    
    // Only block access to role-specific dashboard sections
    // Don't redirect renovators - they have their own /renovator routes
    if (location.pathname.startsWith('/dashboard/landlord') && assignedRole !== 'landlord') {
      toast({
        title: "Access restricted",
        description: "You need to be a Landlord to access this section",
        variant: "destructive",
      });
      navigate('/dashboard', { replace: true });
      return;
    }
    
    if (location.pathname.startsWith('/dashboard/admin') && assignedRole !== 'admin') {
      toast({
        title: "Access restricted",
        description: "You need to be an Administrator to access this section",
        variant: "destructive",
      });
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [location.pathname, navigate, user, loading, assignedRole]);

  return <>{children}</>;
}
