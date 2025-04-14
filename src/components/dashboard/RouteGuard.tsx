
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
    if (loading) return;
    
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    
    console.log("Dashboard routing effect - assigned role:", assignedRole);
    console.log("Dashboard routing effect - current path:", location.pathname);
    
    if (location.pathname === '/dashboard') {
      if (assignedRole === 'landlord') {
        navigate('/dashboard/landlord', { replace: true });
        return;
      } else if (assignedRole === 'developer') {
        navigate('/dashboard/developer', { replace: true });
        return;
      } else {
        navigate('/dashboard/profile', { replace: true });
        return;
      }
    }
    
    if (assignedRole === 'seeker') {
      const allowedPaths = [
        '/dashboard/profile',
        '/dashboard/profile/roommate',
        '/dashboard/profile/co-owner',
        '/dashboard/roommate-recommendations',
        '/dashboard/rent-opportunities',
        '/dashboard/rent-savings',
        '/dashboard/co-owner-recommendations',
        '/dashboard/co-ownership-opportunities',
        '/dashboard/wallet',
        '/dashboard/legal-assistant',
        '/dashboard/chats'
      ];
      
      const isPathAllowed = allowedPaths.some(path => location.pathname.startsWith(path));
      
      if (!isPathAllowed) {
        toast({
          title: "Access Restricted",
          description: "This section is only available to landlords or developers",
          variant: "destructive",
        });
        navigate('/dashboard/profile', { replace: true });
      }
    }
    
    if (assignedRole === 'landlord') {
      const allowedPaths = [
        '/dashboard/landlord',
        '/dashboard/properties',
        '/dashboard/tenants',
        '/dashboard/leases',
        '/dashboard/messages'
      ];
      
      const isPathAllowed = allowedPaths.some(path => location.pathname.startsWith(path));
      
      if (!isPathAllowed) {
        toast({
          title: "Access Restricted",
          description: "This section is only available to seekers or developers",
          variant: "destructive",
        });
        navigate('/dashboard/landlord', { replace: true });
      }
    }
    
    if (assignedRole === 'developer') {
      const allowedPaths = [
        '/dashboard/developer',
        '/dashboard/properties',
        '/dashboard/pricing',
        '/dashboard/analytics',
        '/dashboard/messages',
        '/dashboard/inquiries',
        '/dashboard/potential-buyers'
      ];
      
      const isPathAllowed = allowedPaths.some(path => location.pathname.startsWith(path));
      
      if (!isPathAllowed) {
        toast({
          title: "Access Restricted",
          description: "This section is only available to seekers or landlords",
          variant: "destructive",
        });
        navigate('/dashboard/developer', { replace: true });
      }
    }
  }, [location.pathname, assignedRole, navigate, user, loading]);

  return <>{children}</>;
}
