
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
        <div className="flex flex-1">
          {/* Fixed sidebar */}
          <DashboardSidebar />
          
          {/* Main content container with header and scrollable area */}
          <div className="flex flex-col w-full min-h-screen">
            {/* Fixed top navbar */}
            <div className="sticky top-0 z-10 bg-background border-b">
              <UserMenu />
            </div>
            
            {/* Scrollable content area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
            
            {/* Footer that spans full width under content */}
            <Footer className="w-full mt-auto" />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
