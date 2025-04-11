
import { PieChart, Building, Users, FileText, MessageSquare } from "lucide-react";
import { SidebarMenuSection } from "./SidebarMenuSection";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface LandlordSidebarProps {
  isActive: (path: string) => boolean;
}

export function LandlordSidebar({ isActive }: LandlordSidebarProps) {
  // Property subsections
  const propertySubItems = [
    { label: "All Properties", path: "/dashboard/properties" },
    { label: "Add Property", path: "/dashboard/properties/add" }
  ];

  // Tenants subsections
  const tenantsSubItems = [
    { label: "Applications", path: "/dashboard/tenants/applications" },
    { label: "Current Tenants", path: "/dashboard/tenants/current" }
  ];

  return (
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
  );
}
