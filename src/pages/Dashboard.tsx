
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
