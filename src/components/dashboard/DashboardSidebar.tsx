
import { useLocation, Link } from "react-router-dom";
import {
  User,
  Home,
  Wallet,
  MessageSquare,
  Building,
  GraduationCap,
} from "lucide-react";
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
import { SidebarMenuSection } from "./sidebar/SidebarMenuSection";
import { SidebarSimpleMenuItem } from "./sidebar/SidebarSimpleMenuItem";

export function DashboardSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Profile section sub-items
  const profileSubItems = [
    { label: "Roommate", path: "/dashboard/profile/roommate" },
    { label: "Co-owner", path: "/dashboard/profile/co-owner" }
  ];

  // Log current location for debugging
  console.log("Current location:", location.pathname);

  // Rent section sub-items
  const rentSubItems = [
    { label: "Roommate Recommendations", path: "/dashboard/roommate-recommendations" },
    { label: "Rent Savings", path: "/dashboard/rent-savings" },
    { label: "Opportunities", path: "/dashboard/rent-opportunities" }
  ];

  // Co-ownership section sub-items
  const coOwnershipSubItems = [
    { label: "Co-owner Recommendations", path: "/dashboard/co-owner-recommendations" },
    { label: "Opportunities", path: "/dashboard/co-ownership-opportunities" }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center p-4">
        <h2 className="text-xl font-bold">Roommate Finder</h2>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Profile Section */}
              <SidebarMenuSection 
                title="Profile" 
                icon={User} 
                subItems={profileSubItems} 
                isActive={isActive} 
              />

              {/* Rent Section */}
              <SidebarMenuSection 
                title="Rent" 
                icon={Home} 
                subItems={rentSubItems} 
                isActive={isActive} 
              />

              {/* Co-ownership Section */}
              <SidebarMenuSection 
                title="Co-ownership" 
                icon={Building} 
                subItems={coOwnershipSubItems} 
                isActive={isActive} 
              />

              {/* Simple menu items */}
              <SidebarSimpleMenuItem 
                title="Wallet" 
                icon={Wallet} 
                path="/dashboard/wallet" 
                isActive={isActive} 
              />

              <SidebarSimpleMenuItem 
                title="AI Legal Assistant" 
                icon={GraduationCap} 
                path="/dashboard/legal-assistant" 
                isActive={isActive} 
              />

              <SidebarSimpleMenuItem 
                title="Chats" 
                icon={MessageSquare} 
                path="/dashboard/chats" 
                isActive={isActive} 
              />
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
