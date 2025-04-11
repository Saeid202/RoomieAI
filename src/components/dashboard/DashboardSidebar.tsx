
import { useLocation, Link } from "react-router-dom";
import {
  User,
  Home,
  Wallet,
  MessageSquare,
  Building,
  GraduationCap,
  PieChart,
  Users,
  FileText,
  DollarSign,
  BarChart,
  HardHat,
  Tag,
  ShoppingBag,
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
import { RoleToggle } from "./RoleToggle";
import { useRole } from "@/contexts/RoleContext";

export function DashboardSidebar() {
  const location = useLocation();
  const { role } = useRole();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Log current location for debugging
  console.log("Current location:", location.pathname);
  console.log("Current role:", role);

  // Seeker-specific sections
  const profileSubItems = [
    { label: "Roommate", path: "/dashboard/profile/roommate" },
    { label: "Co-owner", path: "/dashboard/profile/co-owner" }
  ];

  const rentSubItems = [
    { label: "Roommate Recommendations", path: "/dashboard/roommate-recommendations" },
    { label: "Rent Savings", path: "/dashboard/rent-savings" },
    { label: "Opportunities", path: "/dashboard/rent-opportunities" }
  ];

  const coOwnershipSubItems = [
    { label: "Co-owner Recommendations", path: "/dashboard/co-owner-recommendations" },
    { label: "Opportunities", path: "/dashboard/co-ownership-opportunities" }
  ];

  // Landlord-specific sections
  const propertySubItems = [
    { label: "All Properties", path: "/dashboard/properties" },
    { label: "Add Property", path: "/dashboard/properties/add" }
  ];

  const tenantsSubItems = [
    { label: "Applications", path: "/dashboard/tenants/applications" },
    { label: "Current Tenants", path: "/dashboard/tenants/current" }
  ];

  // Developer-specific sections
  const developerPropertiesSubItems = [
    { label: "For Sale Properties", path: "/dashboard/properties" },
    { label: "Add Property", path: "/dashboard/properties/add" }
  ];

  const salesSubItems = [
    { label: "Inquiries", path: "/dashboard/inquiries" },
    { label: "Potential Buyers", path: "/dashboard/potential-buyers" }
  ];

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
                // Seeker menu items
                <>
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
                </>
              ) : role === 'landlord' ? (
                // Landlord menu items
                <>
                  <SidebarSimpleMenuItem 
                    title="Dashboard" 
                    icon={PieChart} 
                    path="/dashboard/landlord" 
                    isActive={isActive} 
                  />

                  <SidebarMenuSection 
                    title="Properties" 
                    icon={Building} 
                    subItems={propertySubItems} 
                    isActive={isActive} 
                  />

                  <SidebarMenuSection 
                    title="Tenants" 
                    icon={Users} 
                    subItems={tenantsSubItems} 
                    isActive={isActive} 
                  />

                  <SidebarSimpleMenuItem 
                    title="Lease Management" 
                    icon={FileText} 
                    path="/dashboard/leases" 
                    isActive={isActive} 
                  />

                  <SidebarSimpleMenuItem 
                    title="Messages" 
                    icon={MessageSquare} 
                    path="/dashboard/messages" 
                    isActive={isActive} 
                  />
                </>
              ) : (
                // Developer menu items
                <>
                  <SidebarSimpleMenuItem 
                    title="Dashboard" 
                    icon={PieChart} 
                    path="/dashboard/developer" 
                    isActive={isActive} 
                  />

                  <SidebarMenuSection 
                    title="Properties for Sale" 
                    icon={Building} 
                    subItems={developerPropertiesSubItems} 
                    isActive={isActive} 
                  />

                  <SidebarMenuSection 
                    title="Sales" 
                    icon={ShoppingBag} 
                    subItems={salesSubItems} 
                    isActive={isActive} 
                  />

                  <SidebarSimpleMenuItem 
                    title="Pricing" 
                    icon={Tag} 
                    path="/dashboard/pricing" 
                    isActive={isActive} 
                  />

                  <SidebarSimpleMenuItem 
                    title="Analytics" 
                    icon={BarChart} 
                    path="/dashboard/analytics" 
                    isActive={isActive} 
                  />

                  <SidebarSimpleMenuItem 
                    title="Messages" 
                    icon={MessageSquare} 
                    path="/dashboard/messages" 
                    isActive={isActive} 
                  />
                </>
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
