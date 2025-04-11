
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { RoleToggle } from "./RoleToggle";
import { useRole } from "@/contexts/RoleContext";
import { SeekerSidebar } from "./sidebar/SeekerSidebar";
import { LandlordSidebar } from "./sidebar/LandlordSidebar";
import { DeveloperSidebar } from "./sidebar/DeveloperSidebar";

export function DashboardSidebar() {
  const location = useLocation();
  const { role } = useRole();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Log current location for debugging
  console.log("Current location:", location.pathname);
  console.log("Current role:", role);

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center p-4">
        <h2 className="text-xl font-bold">
          {role === 'landlord' ? 'Landlord Portal' : 
           role === 'developer' ? 'Developer Portal' : 
           'Roommate Finder'}
        </h2>
      </SidebarHeader>
      
      <RoleToggle />
      
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
        <Button variant="secondary" className="w-full" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
