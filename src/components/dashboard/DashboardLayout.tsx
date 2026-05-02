
import { ReactNode, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserMenu } from "@/components/dashboard/UserMenu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top of the main content area on every route change
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 overflow-x-hidden">
          <DashboardSidebar />
          
          <div className="flex flex-col w-full min-h-screen overflow-x-hidden">
            <div className="sticky top-0 z-10 bg-background border-b">
              <UserMenu />
            </div>
            
            <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden md:px-6 pb-6 bg-gray-100">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
