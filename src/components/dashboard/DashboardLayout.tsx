
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
    <div className="flex flex-col min-h-screen bg-background">
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex w-full flex-1 relative pt-16"> 
          {/* Fixed sidebar */}
          <DashboardSidebar />
          
          {/* Main content area with proper scrolling */}
          <main className="flex-1 w-full flex flex-col min-h-[calc(100vh-4rem)]">
            <UserMenu />
            <div className="p-4 md:p-6 flex-1 overflow-y-auto">
              {children}
            </div>
            
            {/* Footer anchored at the bottom */}
            <Footer className="mt-auto w-full shrink-0" />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
