import { User, Home, Wallet, MessageSquare, Building, GraduationCap } from "lucide-react";
import { SidebarMenuSection } from "./SidebarMenuSection";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface SeekerSidebarProps {
  isActive: (path: string) => boolean;
}

export function SeekerSidebar({ isActive }: SeekerSidebarProps) {
  const profileSubItems = [
    { label: "My Profile", path: "/dashboard/profile" }
  ];

  const rentSubItems = [
    { label: "Find My Ideal Roommate", path: "/dashboard/roommate-recommendations" },
    { label: "My Future Housing Plan", path: "/dashboard/future-housing-plan" },
    { label: "Rent Savings", path: "/dashboard/rent-savings" },
    { label: "Opportunities", path: "/dashboard/rent-opportunities" }
  ];

  const coOwnershipSubItems = [
    { label: "Co-owner Profile", path: "/dashboard/profile/co-owner" },
    { label: "Co-owner Recommendations", path: "/dashboard/co-owner-recommendations" },
    { label: "Opportunities", path: "/dashboard/co-ownership-opportunities" }
  ];

  return (
    <>
      <SidebarMenuSection 
        title="Profile" 
        icon={User} 
        subItems={profileSubItems} 
        isActive={isActive} 
      />

      <SidebarMenuSection 
        title="Rent" 
        icon={Home} 
        subItems={rentSubItems} 
        isActive={isActive} 
      />

      <SidebarMenuSection 
        title="Co-ownership" 
        icon={Building} 
        subItems={coOwnershipSubItems} 
        isActive={isActive} 
      />

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
