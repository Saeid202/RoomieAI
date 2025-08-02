import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "@/hooks/use-toast";

interface SecureRouteGuardProps {
  children: ReactNode;
}

/**
 * Secure route guard that uses server-side role validation
 * Replaces the old RouteGuard with proper security checks
 */
export function SecureRouteGuard({ children }: SecureRouteGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, hasRole } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading || roleLoading) return;

      if (!user) {
        console.log("SecureRouteGuard: No user found, redirecting to home");
        toast({
          title: "Authentication required",
          description: "Please log in to access this page",
          variant: "destructive",
        });
        navigate("/", { replace: true });
        return;
      }

      // Check role-based access using server-side validation
      const currentPath = location.pathname;
      let hasAccess = true;
      
      // Admin routes
      if (currentPath.startsWith('/dashboard/admin')) {
        hasAccess = await hasRole('admin');
        if (!hasAccess) {
          console.log("SecureRouteGuard: Non-admin trying to access admin routes");
          toast({
            title: "Access denied",
            description: "You need administrator privileges to access this section",
            variant: "destructive",
          });
          navigate("/dashboard", { replace: true });
          return;
        }
      }
      
      // Landlord routes
      if (currentPath.startsWith('/dashboard/landlord')) {
        hasAccess = await hasRole('landlord');
        if (!hasAccess) {
          console.log("SecureRouteGuard: Non-landlord trying to access landlord routes");
          toast({
            title: "Access denied",
            description: "You need landlord privileges to access this section",
            variant: "destructive",
          });
          navigate("/dashboard", { replace: true });
          return;
        }
      }
      
      // Developer routes
      if (currentPath.startsWith('/dashboard/developer')) {
        hasAccess = await hasRole('developer');
        if (!hasAccess) {
          console.log("SecureRouteGuard: Non-developer trying to access developer routes");
          toast({
            title: "Access denied",
            description: "You need developer privileges to access this section",
            variant: "destructive",
          });
          navigate("/dashboard", { replace: true });
          return;
        }
      }

      // Redirect to appropriate dashboard if on root dashboard path
      if (currentPath === '/dashboard') {
        if (role === 'admin') {
          navigate('/dashboard/admin', { replace: true });
        } else if (role === 'landlord') {
          navigate('/dashboard/landlord', { replace: true });
        } else if (role === 'developer') {
          navigate('/dashboard/developer', { replace: true });
        } else {
          navigate('/dashboard/roommate-recommendations', { replace: true });
        }
        return;
      }

      setAccessChecked(true);
    };

    checkAccess();
  }, [user, authLoading, roleLoading, role, location.pathname, navigate, hasRole]);

  if (authLoading || roleLoading || !accessChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}