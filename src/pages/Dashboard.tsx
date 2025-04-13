import { Outlet, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Footer from "@/components/Footer";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function Dashboard() {
  const { role, setRole } = useRole();
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    console.log("Dashboard mounted - current role:", role);
    console.log("Dashboard mounted - user:", user?.email);
    console.log("Dashboard mounted - user metadata:", user?.user_metadata);
    console.log("Dashboard mounted - current path:", location.pathname);
    
    const checkUserRole = async () => {
      if (user) {
        const { data } = await supabase.auth.getUser();
        console.log("Dashboard effect - full user data:", data);
        
        const userRole = data.user?.user_metadata?.role;
        console.log("Dashboard effect - checking role from metadata:", userRole);
        
        if (userRole && role !== userRole) {
          console.log("Setting role to match user metadata:", userRole);
          setRole(userRole);
        } else if (!userRole) {
          console.warn("No role found in user metadata in Dashboard effect");
        }
      }
    };
    
    checkUserRole();
  }, [loading, user, setRole]);
  
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
  
  if (location.pathname === '/dashboard') {
    if (assignedRole === 'landlord') {
      return <Navigate to="/dashboard/landlord" replace />;
    } else if (assignedRole === 'developer') {
      return <Navigate to="/dashboard/developer" replace />;
    } else {
      return <Navigate to="/dashboard/profile" replace />;
    }
  }
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 pt-16">
        <SidebarProvider defaultOpen={!isMobile}>
          <div className="flex w-full relative"> 
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto pb-16 w-full">
              <div className="absolute top-4 right-4 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User size={16} />
                      {user?.email ? user.email.split('@')[0] : 'Account'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
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
