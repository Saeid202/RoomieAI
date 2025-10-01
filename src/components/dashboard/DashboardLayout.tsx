
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileNavigation } from "@/components/dashboard/MobileNavigation";
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
        <div className="flex flex-1">
          {/* Fixed sidebar - hidden on mobile */}
          <DashboardSidebar />
          
          {/* Main content container with header and scrollable area */}
          <div className="flex flex-col w-full min-h-screen">
            {/* Fixed top navbar */}
            <div className="sticky top-0 z-10 bg-background border-b">
              <UserMenu />
            </div>
            
            {/* Scrollable content area - optimized for mobile */}
            <main className="flex-1 overflow-y-auto md:px-6 pb-32 md:pb-6  bg-background">
              {children}
            </main>
            
            {/* Footer that spans full width under content - hidden on mobile */}
            <Footer className="w-full mt-auto hidden md:block" />
          </div>
        </div>
        
        {/* Mobile bottom navigation */}
        <MobileNavigation />
      </SidebarProvider>
    </div>
  );
}
