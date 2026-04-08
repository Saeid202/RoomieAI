
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
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 overflow-x-hidden">
          <DashboardSidebar />
          
          <div className="flex flex-col w-full min-h-screen overflow-x-hidden">
            <div className="sticky top-0 z-10 bg-background border-b">
              <UserMenu />
            </div>
            
            <main className="flex-1 overflow-y-auto overflow-x-hidden md:px-6 pb-6 bg-background">
              {children}
            </main>
            
            <Footer className="w-full mt-auto hidden md:block" />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
