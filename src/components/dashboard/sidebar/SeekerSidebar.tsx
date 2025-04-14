
import { User, Home, Wallet, MessageSquare, Building, GraduationCap } from "lucide-react";
import { SidebarMenuSection } from "./SidebarMenuSection";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface SeekerSidebarProps {
  isActive: (path: string) => boolean;
}

export function SeekerSidebar({ isActive }: SeekerSidebarProps) {
  // Profile subsections - removed roommate
  const profileSubItems = [
    { label: "My Profile", path: "/dashboard/profile" }
  ];

  // Rent subsections - renamed Roommate Recommendations to Find My Ideal Roommate
  const rentSubItems = [
    { label: "Find My Ideal Roommate", path: "/dashboard/roommate-recommendations" },
    { label: "Rent Savings", path: "/dashboard/rent-savings" },
    { label: "Opportunities", path: "/dashboard/rent-opportunities" }
  ];

  // Co-ownership subsections - added Co-owner Profile
  const coOwnershipSubItems = [
    { label: "Co-owner Profile", path: "/dashboard/profile/co-owner" },
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
