
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
import { useRole } from "@/contexts/RoleContext";
import { SeekerSidebar } from "./sidebar/SeekerSidebar";
import { LandlordSidebar } from "./sidebar/LandlordSidebar";
import { DeveloperSidebar } from "./sidebar/DeveloperSidebar";
import { AdminSidebar } from "./sidebar/AdminSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";

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
        <Sidebar className={`h-screen fixed top-0 left-0 ${isMobile ? (open ? 'flex' : 'hidden') : 'hidden md:flex'}`}>
          <SidebarHeader className="flex items-center justify-center p-4">
            <h2 className="text-2xl font-bold">
              {role === 'landlord' ? 'Landlord Portal' :
               role === 'admin' ? 'Admin Portal' :
               'Roommate Finder'}
            </h2>
          </SidebarHeader>
        
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {role === 'admin' ? (
                  <AdminSidebar isActive={isActive} />
                ) : role === 'landlord' ? (
                  <LandlordSidebar isActive={isActive} />
                ) : (
                  <SeekerSidebar isActive={isActive} />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button variant="secondary" className="w-full" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
