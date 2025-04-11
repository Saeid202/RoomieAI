
import { User, Home, Wallet, MessageSquare, Building, GraduationCap } from "lucide-react";
import { SidebarMenuSection } from "./SidebarMenuSection";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface SeekerSidebarProps {
  isActive: (path: string) => boolean;
}

export function SeekerSidebar({ isActive }: SeekerSidebarProps) {
  // Profile subsections
  const profileSubItems = [
    { label: "Roommate", path: "/dashboard/profile/roommate" },
    { label: "Co-owner", path: "/dashboard/profile/co-owner" }
  ];

  // Rent subsections
  const rentSubItems = [
    { label: "Roommate Recommendations", path: "/dashboard/roommate-recommendations" },
    { label: "Rent Savings", path: "/dashboard/rent-savings" },
    { label: "Opportunities", path: "/dashboard/rent-opportunities" }
  ];

  // Co-ownership subsections
  const coOwnershipSubItems = [
    { label: "Co-owner Recommendations", path: "/dashboard/co-owner-recommendations" },
    { label: "Opportunities", path: "/dashboard/co-ownership-opportunities" }
  ];

  return (
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
  );
}
