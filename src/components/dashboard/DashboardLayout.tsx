import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

interface DashboardLayoutProps {
   children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-screen bg-background">
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1">
         <UserMenu />
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <DashboardContent />
          </main>
        </div>
      </SidebarProvider>
      <Footer className="w-full mt-auto shrink-0" />{" "}
    </div>
  );
}
