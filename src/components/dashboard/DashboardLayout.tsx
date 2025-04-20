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
    // <div className="flex flex-col min-h-screen">
    //   <div className="flex flex-1 ">
    //     <SidebarProvider defaultOpen={!isMobile}>
    //       <div className="flex w-full relative">
    //         <DashboardSidebar />
    //         <main className="flex-1 overflow-y-auto pb-16 w-full">
    //           <UserMenu />
    //           <div className="p-4 md:p-4">
    //             {children}
    //           </div>
    //         </main>
    //       </div>
    //     </SidebarProvider>
    //   </div>
    //   <Footer className="mt-auto" />
    // </div>

    <div className="flex flex-col  bg-background">
    <SidebarProvider defaultOpen={!isMobile}>
      {/* <div className="flex flex-1 min-h-screen"> */}
        {/* Sidebar - remove fixed positioning and make it grow vertically */}
        {/* <div className="w-64 bg-white shadow-sm border-r border-gray-200"> */}
          <DashboardSidebar />
        {/* </div> */}
  
        {/* Main content */}
        <div className="flex flex-col flex-1">
          <UserMenu />
          {/* <div className="flex-1 overflow-y-auto p-4 md:p-4">{children}</div> */}
        {/* </div> */}
      </div>
    </SidebarProvider>
  
    {/* Footer - full width, always after main content */}
    <Footer className="w-full mt-auto shrink-0" />
  </div>
    // <div className="flex flex-col min-h-screen bg-background">
    //   <SidebarProvider defaultOpen={!isMobile}>
    //     <div className="flex w-full flex-1 relative">
    //       {/* Fixed sidebar */}
    //       <div className="w-64 p-6 bg-white shadow-sm border-r border-gray-200">
    //         <DashboardSidebar />
    //       </div>

    //       {/* Main content area with proper scrolling */}
    //       <main className="flex-1 w-full flex flex-col min-h-[calc(100vh-4rem)]">
    //         <UserMenu />
    //         <div className="p-4 md:p-4 flex-1 overflow-y-auto">
    //           {children}
    //         </div>

    //       </main>
    //     </div>
    //   </SidebarProvider>
    //     {/* Footer anchored at the bottom */}
    //     <Footer className="mt-auto w-full shrink-0" />
    // </div>
  );
}
