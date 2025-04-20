
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarSeparator,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { RoleToggle } from "./RoleToggle";
import { useRole } from "@/contexts/RoleContext";
import { SeekerSidebar } from "./sidebar/SeekerSidebar";
import { LandlordSidebar } from "./sidebar/LandlordSidebar";
import { DeveloperSidebar } from "./sidebar/DeveloperSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X ,ChartNoAxesGantt} from "lucide-react";

export function DashboardSidebar() {
  const location = useLocation();
  const { role } = useRole();
  const { open, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  console.log("DashboardSidebar - Current location:", location.pathname);
  console.log("DashboardSidebar - Current role:", role);
  console.log("DashboardSidebar - Is mobile:", isMobile);
  console.log("DashboardSidebar - Sidebar open:", open);

  return (
    <>
      {/* Mobile toggle button - highly visible */}
      {isMobile && (
        <Button 
          variant="default" 
          size="icon" 
          onClick={toggleSidebar} 
          className="fixed top-4 left-4 z-50 bg-primary text-white shadow-lg hover:bg-roomie-purple/90"
          aria-label="Toggle Menu"
        >
          {open ? <ChartNoAxesGantt size={24}/>: <Menu size={24} />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      )}
      <Sidebar className="bg-[#F4F0FF] absolute">
        <SidebarHeader className="flex items-center justify-center p-2">
          {/* <h2 className="text-xl font-bold">
            {role === 'landlord' ? 'Landlord Portal' : 
             role === 'developer' ? 'Developer Portal' : 
             'Roommate Finder'}
          </h2> */}
           <RoleToggle />
        </SidebarHeader>
        
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {role === 'seeker' ? (
                  <SeekerSidebar isActive={isActive} />
                ) : role === 'landlord' ? (
                  <LandlordSidebar isActive={isActive} />
                ) : (
                  <DeveloperSidebar isActive={isActive} />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button variant="secondary" className="w-full bg-primary" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
