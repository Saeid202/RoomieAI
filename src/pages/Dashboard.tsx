
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Footer from "@/components/Footer";
import { useRole } from "@/contexts/RoleContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { role } = useRole();
  const location = useLocation();
  
  // Redirect based on current role if needed
  useEffect(() => {
    console.log("Dashboard role effect - current role:", role);
    console.log("Dashboard role effect - current path:", location.pathname);
  }, [role, location.pathname]);
  
  // Handle redirects for role-specific sections
  if (role === 'landlord' && location.pathname === '/dashboard') {
    return <Navigate to="/dashboard/landlord" replace />;
  }
  
  if (role === 'seeker' && location.pathname === '/dashboard/landlord') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 pt-16"> {/* Space for navbar */}
        <SidebarProvider>
          <div className="flex w-full"> 
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto pb-16"> {/* Added padding bottom to prevent content being hidden by footer */}
              <div className="p-6">
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
