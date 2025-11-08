
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
import { Home } from "lucide-react";

export function DashboardSidebar() {
  const location = useLocation();
  const { role } = useRole();
  const { open, toggleSidebar, isMobile } = useSidebar();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  console.log("DashboardSidebar - Current location:", location.pathname);
  console.log("DashboardSidebar - Current role:", role);
  console.log("DashboardSidebar - Is mobile:", isMobile);
  console.log("DashboardSidebar - Sidebar open:", open);

  // Don't render on mobile, let the mobile navigation handle it
  if (isMobile) {
    return null;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-center p-4">
        {open ? (
          <h2 className="text-2xl font-bold">
            {role === "landlord"
              ? "Landlord Portal"
              : role === "admin"
              ? "Admin Portal"
              : "Roommate Finder"}
          </h2>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            className="text-roomie-purple"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7" />
            <path d="M9 22V12h6v10" />
          </svg>
        )}
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
          {open ? (
            <Button variant="secondary" className="w-full" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          ) : (
            <Link to="/" className="flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-roomie-purple/20 flex items-center justify-center">
                <Home className="text-roomie-purple" size={22} />
              </div>
            </Link>
          )}
        </SidebarFooter>
      </Sidebar>
  );
}
