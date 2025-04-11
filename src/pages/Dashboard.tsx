
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function Dashboard() {
  return (
    <div className="flex h-full pt-16"> {/* Add h-full and keep pt-16 for navbar space */}
      <SidebarProvider>
        <div className="flex w-full flex-1"> 
          <DashboardSidebar />
          <main className="flex-1 p-6 overflow-y-auto"> {/* Add overflow-y-auto */}
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
