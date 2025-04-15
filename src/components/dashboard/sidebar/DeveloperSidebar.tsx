
import { Building, ShoppingBag, MessageSquare } from "lucide-react";
import { SidebarMenuSection } from "./SidebarMenuSection";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface DeveloperSidebarProps {
  isActive: (path: string) => boolean;
}

export function DeveloperSidebar({ isActive }: DeveloperSidebarProps) {
  // Developer property subsections
  const developerPropertiesSubItems = [
    { label: "For Sale Properties", path: "/dashboard/properties" },
    { label: "Add Property", path: "/dashboard/properties/add" }
  ];

  // Sales subsections
  const salesSubItems = [
    { label: "Inquiries", path: "/dashboard/inquiries" },
    { label: "Potential Buyers", path: "/dashboard/potential-buyers" }
  ];

  return (
    <>
      <SidebarSimpleMenuItem 
        title="Dashboard" 
        icon={Building} 
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
        title="Messages" 
        icon={MessageSquare} 
        path="/dashboard/messages" 
        isActive={isActive} 
      />
    </>
  );
}
