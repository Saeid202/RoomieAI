
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserMenu } from "@/components/dashboard/UserMenu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 pt-16">
        <SidebarProvider defaultOpen={!isMobile}>
          <div className="flex w-full relative"> 
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto pb-16 w-full">
              <UserMenu />
              <div className="p-4 md:p-6">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </div>
      <Footer className="mt-auto" />
    </div>
  );
}
