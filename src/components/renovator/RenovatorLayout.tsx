import { ReactNode } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu } from "@/components/ui/sidebar";
import { MobileNavigation } from "@/components/dashboard/MobileNavigation";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { RenovatorSidebar } from "@/components/dashboard/sidebar/RenovatorSidebar";
import { useLocation, Outlet } from "react-router-dom";

interface RenovatorLayoutProps {
  children?: ReactNode;
}

export function RenovatorLayout({ children }: RenovatorLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1">
          {/* Fixed sidebar - hidden on mobile */}
          <Sidebar className="hidden md:flex">
            <SidebarHeader className="border-b p-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="font-semibold">Renovator Portal</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <RenovatorSidebar isActive={isActive} showLabels={true} />
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          
          {/* Main content container with header and scrollable area */}
          <div className="flex flex-col w-full min-h-screen">
            {/* Fixed top navbar */}
            <div className="sticky top-0 z-10 bg-background border-b">
              <UserMenu />
            </div>
            
            {/* Scrollable content area - optimized for mobile */}
            <main className="flex-1 overflow-y-auto md:px-6 pb-32 md:pb-6 bg-background">
              {children || <Outlet />}
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
