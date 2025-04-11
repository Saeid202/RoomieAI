
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Footer from "@/components/Footer";
import { useRole } from "@/contexts/RoleContext";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { role } = useRole();
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Get assigned role from user metadata
  const assignedRole = user?.user_metadata?.role;
  
  // Logging for debugging
  useEffect(() => {
    console.log("Dashboard role effect - current role:", role);
    console.log("Dashboard role effect - assigned role:", assignedRole);
    console.log("Dashboard role effect - current path:", location.pathname);
    console.log("Dashboard is mobile:", isMobile);
  }, [role, assignedRole, location.pathname, user, isMobile]);
  
  // Default redirect to appropriate dashboard based on role
  if (location.pathname === '/dashboard') {
    if (assignedRole === 'landlord') {
      return <Navigate to="/dashboard/landlord" replace />;
    } else if (assignedRole === 'developer') {
      return <Navigate to="/dashboard/developer" replace />;
    } else if (assignedRole === 'seeker') {
      return <Navigate to="/dashboard/profile" replace />;
    }
  }
  
  // Seeker restrictions - only allow seeker paths
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
        description: "You don't have access to this section",
        variant: "destructive",
      });
      return <Navigate to="/dashboard/profile" replace />;
    }
  }
  
  // Landlord restrictions - only allow landlord paths
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
        description: "You don't have access to this section",
        variant: "destructive",
      });
      return <Navigate to="/dashboard/landlord" replace />;
    }
  }
  
  // Developer restrictions - only allow developer paths
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
        description: "You don't have access to this section",
        variant: "destructive",
      });
      return <Navigate to="/dashboard/developer" replace />;
    }
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 pt-16"> {/* Space for navbar */}
        <SidebarProvider defaultOpen={!isMobile}>
          <div className="flex w-full relative"> 
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto pb-16 w-full"> 
              <div className="p-4 md:p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </SidebarProvider>
      </div>
      <Footer className="mt-auto" />
    </div>
  );
}
