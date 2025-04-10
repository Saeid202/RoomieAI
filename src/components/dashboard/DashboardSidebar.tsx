import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  Home,
  Users,
  Wallet,
  MessageSquare,
  ChevronDown,
  Building,
  Handshake,
  GraduationCap,
  UserPlus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  const location = useLocation();
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [rentExpanded, setRentExpanded] = useState(true);
  const [coOwnershipExpanded, setCoOwnershipExpanded] = useState(true);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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
              {/* Profile Section with Sub-items */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setProfileExpanded(!profileExpanded)}
                  className="justify-between"
                >
                  <div className="flex items-center gap-2">
                    <User size={20} />
                    <span>Profile</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${profileExpanded ? "rotate-180" : ""}`}
                  />
                </SidebarMenuButton>

                {profileExpanded && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/dashboard/profile/roommate")}>
                        <Link to="/dashboard/profile?tab=roommate">
                          <span>Roommate</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/dashboard/profile/co-owner")}>
                        <Link to="/dashboard/profile?tab=co-owner">
                          <span>Co-owner</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Rent Section with Sub-items */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setRentExpanded(!rentExpanded)}
                  className="justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Home size={20} />
                    <span>Rent</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${rentExpanded ? "rotate-180" : ""}`}
                  />
                </SidebarMenuButton>

                {rentExpanded && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/dashboard/roommate-recommendations")}>
                        <Link to="/dashboard/roommate-recommendations">
                          <span>Roommate Recommendations</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/dashboard/rent-savings")}>
                        <Link to="/dashboard/rent-savings">
                          <span>Rent Savings</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/dashboard/rent-opportunities")}>
                        <Link to="/dashboard/rent-opportunities">
                          <span>Opportunities</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Co-ownership Section with Sub-items */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setCoOwnershipExpanded(!coOwnershipExpanded)}
                  className="justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Building size={20} />
                    <span>Co-ownership</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${coOwnershipExpanded ? "rotate-180" : ""}`}
                  />
                </SidebarMenuButton>

                {coOwnershipExpanded && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/dashboard/co-owner-recommendations")}>
                        <Link to="/dashboard/co-owner-recommendations">
                          <span>Co-owner Recommendations</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/dashboard/co-ownership-opportunities")}>
                        <Link to="/dashboard/co-ownership-opportunities">
                          <span>Opportunities</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/wallet")}>
                  <Link to="/dashboard/wallet">
                    <Wallet size={20} />
                    <span>Wallet</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/legal-assistant")}>
                  <Link to="/dashboard/legal-assistant">
                    <GraduationCap size={20} />
                    <span>AI Legal Assistant</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard/chats")}>
                  <Link to="/dashboard/chats">
                    <MessageSquare size={20} />
                    <span>Chats</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
