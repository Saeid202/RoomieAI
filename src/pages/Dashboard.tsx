
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      <SidebarProvider>
        <div className="flex w-full flex-1 pt-16"> {/* Padding top matches navbar height */}
          <DashboardSidebar />
          <main className="flex-1 p-6 pb-16"> {/* Added bottom padding to make space for footer */}
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
      <div className="mt-auto"> {/* This ensures footer stays at the bottom without overlapping */}
        <Footer />
      </div>
    </div>
  );
}
