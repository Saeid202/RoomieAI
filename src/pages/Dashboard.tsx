
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Footer from "@/components/Footer";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 pt-16"> {/* Adjust for navbar space */}
        <SidebarProvider>
          <div className="flex w-full"> 
            <DashboardSidebar />
            <main className="flex-1 p-6 overflow-y-auto"> {/* Keep overflow-y-auto */}
              <Outlet />
            </main>
          </div>
        </SidebarProvider>
      </div>
      <Footer className="mt-auto shadow-md" /> {/* Add dashboard footer */}
    </div>
  );
}
