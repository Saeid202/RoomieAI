
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

  const { role } = useRole();
  const assignedRole = user?.user_metadata?.role;

  useEffect(() => {
    if (loading || !user) return;

    // Use role from context (initialized from DB) as primary authority
    // Fallback to metadata role if context role is not yet available
    const currentRole = role || assignedRole;

    // Only block access to role-specific dashboard sections
    if (location.pathname.startsWith('/dashboard/landlord') && currentRole !== 'landlord') {
      console.warn("🚫 RouteGuard - Access denied for landlord route. Role:", currentRole);
      toast({
        title: "Access restricted",
        description: "You need to be a Landlord to access this section",
        variant: "destructive",
      });
      navigate('/dashboard', { replace: true });
      return;
    }

    if (location.pathname.startsWith('/dashboard/admin') && currentRole !== 'admin') {
      console.warn("🚫 RouteGuard - Access denied for admin route. Role:", currentRole);
      toast({
        title: "Access restricted",
        description: "You need to be an Administrator to access this section",
        variant: "destructive",
      });
      navigate('/dashboard', { replace: true });
      return;
    }

    if (location.pathname.startsWith('/dashboard/lawyer') && currentRole !== 'lawyer') {
      console.warn("🚫 RouteGuard - Access denied for lawyer route. Role:", currentRole);
      toast({
        title: "Access restricted",
        description: "You need to be a Lawyer to access this section",
        variant: "destructive",
      });
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [location.pathname, navigate, user, loading, assignedRole, role]);

  return <>{children}</>;
}
