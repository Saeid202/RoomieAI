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
import { RoleSwitcher } from "./RoleSwitcher";
import { useRole } from "@/contexts/RoleContext";
import { SeekerSidebar } from "./sidebar/SeekerSidebar";
import { LandlordSidebar } from "./sidebar/LandlordSidebar";
import { DeveloperSidebar } from "./sidebar/DeveloperSidebar";
import { AdminSidebar } from "./sidebar/AdminSidebar";
import { RenovatorSidebar } from "./sidebar/RenovatorSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { ChevronUp, Settings, LogOut, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardSidebar() {
  const location = useLocation();
  const { role } = useRole();
  const { open, toggleSidebar, isMobile } = useSidebar();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Don't render on mobile, let the mobile navigation handle it
  if (isMobile) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" defaultOpen={true}>
      <SidebarHeader className="flex items-center justify-center p-4 border-b">
        <div className="w-full">
          <RoleSwitcher variant="full-width" />
        </div>
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
              ) : role === 'renovator' ? (
                <RenovatorSidebar isActive={isActive} />
              ) : (
                <SeekerSidebar isActive={isActive} />
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
              <Link to="/dashboard/settings" className="w-full cursor-pointer">
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
  );
}
