
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

  const { role, setRole } = useRole();

  useEffect(() => {
    if (loading || !user) return;

    // Only use role from context (set by RoleInitializer from DB)
    // Do NOT fall back to metadata - it can be stale
    // If role is null, RoleInitializer is still loading - wait
    if (!role) {
      console.log('🔄 RouteGuard: Role is null, waiting for RoleInitializer...');
      return;
    }

    const currentRole = role;

    // Add a small delay to ensure RoleInitializer has time to set the role
    const timeoutId = setTimeout(() => {
      if (!role) {
        console.warn('⏱️ RoleInitializer timeout - role still null, forcing fallback');
        const fallbackRole = user?.user_metadata?.role || 'seeker';
        setRole(fallbackRole);
        console.log('🔧 RoleInitializer - Using fallback role:', fallbackRole);
      }
    }, 1000);

    // 30. STRICT BILATERAL BLOCKING
    const path = location.pathname;

    // A. Define Seeker-only paths
    const isSeekerOnlyPath = 
      path === '/dashboard' || 
      path.startsWith('/dashboard/roommate-recommendations') ||
      path.startsWith('/dashboard/ideal-roommate') ||
      path.startsWith('/dashboard/rental-options') ||
      path.startsWith('/dashboard/buying-opportunities') ||
      path.startsWith('/dashboard/applications') ||
      path.startsWith('/dashboard/co-ownership');

    // B. Rejection Logic
    
    // 1. Block Non-Landlords from Landlord dashboard (admin can access)
    if (path.startsWith('/dashboard/landlord') && currentRole !== 'landlord' && currentRole !== 'admin') {
      redirectToHome(currentRole, "Landlord");
      return;
    }

    // 2. Block Non-Seekers from Seeker-only sections (admin can access all)
    if (isSeekerOnlyPath && currentRole !== 'seeker' && currentRole !== 'admin') {
      redirectToHome(currentRole, "Seeker");
      return;
    }
    // Admin can access digital-wallet and other shared paths
    if (path.startsWith('/dashboard/digital-wallet') && currentRole !== 'seeker' && currentRole !== 'admin') {
      redirectToHome(currentRole, "Seeker");
      return;
    }
    if (path.startsWith('/dashboard/admin') && currentRole !== 'admin') {
      redirectToHome(currentRole, "Administrator");
      return;
    }

    // 4. Block Non-Renovators from Renovator dashboard
    if (path.startsWith('/renovator') && currentRole !== 'renovator') {
      redirectToHome(currentRole, "Renovator");
      return;
    }

    // 5. Block Non-Lawyers from Lawyer dashboard
    if (path.startsWith('/dashboard/lawyer') && currentRole !== 'lawyer') {
      redirectToHome(currentRole, "Lawyer");
      return;
    }

    // 6. Block Non-Brokers from Broker dashboard
    if (path.startsWith('/dashboard/mortgage-broker') && currentRole !== 'mortgage_broker') {
      redirectToHome(currentRole, "Mortgage Broker");
      return;
    }

    // 7. Block Non-Lenders from Lender dashboard
    if (path.startsWith('/dashboard/lender') && currentRole !== 'lender') {
      redirectToHome(currentRole, "Lender");
      return;
    }

  }, [location.pathname, navigate, user, loading, role]);

  const redirectToHome = (currentRole: string, targetRoleName: string) => {
    console.warn(`🚫 RouteGuard - Access denied for ${targetRoleName} route. User is:`, currentRole);
    
    // Auto-teleport to their correct home without showing the red error message
    switch (currentRole) {
      case 'landlord': navigate('/dashboard/landlord', { replace: true }); break;
      case 'renovator': navigate('/renovator/dashboard', { replace: true }); break;
      case 'admin': navigate('/dashboard/admin', { replace: true }); break;
      case 'lawyer': navigate('/dashboard/lawyer', { replace: true }); break;
      case 'mortgage_broker': navigate('/dashboard/mortgage-broker', { replace: true }); break;
      case 'lender': navigate('/dashboard/lender', { replace: true }); break;
      default: navigate('/dashboard/roommate-recommendations', { replace: true });
    }
  };

  return <>{children}</>;
}
