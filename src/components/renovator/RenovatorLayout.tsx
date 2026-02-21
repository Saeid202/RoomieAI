import { ReactNode } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarFooter } from "@/components/ui/sidebar";
import { MobileNavigation } from "@/components/dashboard/MobileNavigation";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { RenovatorSidebar } from "@/components/dashboard/sidebar/RenovatorSidebar";
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Home, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RenovatorLayoutProps {
  children?: ReactNode;
}

export function RenovatorLayout({ children }: RenovatorLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
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
              <RoleSwitcher variant="full-width" />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <RenovatorSidebar isActive={isActive} showLabels={true} />
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t space-y-2">
              {/* User Account Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 h-auto py-3 gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col items-start text-left min-w-0 flex-1 overflow-hidden">
                      <span className="text-sm font-semibold truncate w-full">{user?.email?.split('@')[0]}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">{user?.email}</span>
                    </div>
                    <ChevronUp className="h-4 w-4 ml-auto text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" side="top" sideOffset={8}>
                  <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/renovator/settings" className="w-full cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Back to Home Link */}
              <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </Button>
            </SidebarFooter>
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
