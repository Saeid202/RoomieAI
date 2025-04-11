
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Footer from "@/components/Footer";

export default function Dashboard() {
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
