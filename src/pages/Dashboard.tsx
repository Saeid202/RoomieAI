
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Footer from "@/components/Footer";
import { useRole } from "@/contexts/RoleContext";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Dashboard() {
  const { role } = useRole();
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Redirect based on current role if needed
  useEffect(() => {
    console.log("Dashboard role effect - current role:", role);
    console.log("Dashboard role effect - current path:", location.pathname);
    console.log("Dashboard role effect - user metadata:", user?.user_metadata);
    console.log("Dashboard is mobile:", isMobile);
  }, [role, location.pathname, user, isMobile]);
  
  // Handle redirects for role-specific sections
  if (role === 'landlord' && location.pathname === '/dashboard') {
    return <Navigate to="/dashboard/landlord" replace />;
  }
  
  if (role === 'developer' && location.pathname === '/dashboard') {
    return <Navigate to="/dashboard/developer" replace />;
  }
  
  if (role === 'seeker' && (location.pathname === '/dashboard/landlord' || location.pathname === '/dashboard/developer')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 pt-16"> {/* Space for navbar */}
        <SidebarProvider defaultOpen={false}>
          <div className="flex w-full relative"> 
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto pb-16 w-full"> {/* Added w-full for mobile */}
              <div className="p-4 md:p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </SidebarProvider>
      </div>
      <Footer className="mt-auto" /> {/* Footer at the bottom */}
    </div>
  );
}
