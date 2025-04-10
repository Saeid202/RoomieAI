
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Footer from "@/components/Footer";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Remove the duplicate Navbar from here */}
      <SidebarProvider>
        <div className="flex w-full flex-1 pt-16"> {/* Keep padding-top for navbar space */}
          <DashboardSidebar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
      {/* Footer is now part of the main App layout, so we don't need it here */}
    </div>
  );
}
