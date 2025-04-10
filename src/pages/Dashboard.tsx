
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SidebarProvider>
        <div className="flex w-full flex-1">
          <DashboardSidebar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
      <Footer />
    </div>
  );
}
