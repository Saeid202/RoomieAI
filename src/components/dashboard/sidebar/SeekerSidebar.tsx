
import { Link } from "react-router-dom";
import { 
  Home, Users, Building, Search, MessageSquare, 
  Wallet, Scale, Settings, User, UserPlus 
} from "lucide-react";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface SeekerSidebarProps {
  isActive: (path: string) => boolean;
}

export function SeekerSidebar({ isActive }: SeekerSidebarProps) {
  return (
    <>
      <SidebarSimpleMenuItem 
        icon={<Home size={18} />} 
        label="Dashboard"
        to="/dashboard" 
        isActive={isActive('/dashboard')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Users size={18} />} 
        label="Roommate Matches"
        to="/dashboard/roommate-recommendations" 
        isActive={isActive('/dashboard/roommate-recommendations')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<User size={18} />} 
        label="Roommate Profile"
        to="/dashboard/profile/roommate" 
        isActive={isActive('/dashboard/profile/roommate')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<User size={18} />} 
        label="Co-Owner Profile"
        to="/dashboard/profile/co-owner" 
        isActive={isActive('/dashboard/profile/co-owner')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<UserPlus size={18} />} 
        label="Co-Owner Matches"
        to="/dashboard/co-owner-recommendations" 
        isActive={isActive('/dashboard/co-owner-recommendations')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Building size={18} />} 
        label="Rent Opportunities"
        to="/dashboard/rent-opportunities" 
        isActive={isActive('/dashboard/rent-opportunities')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Building size={18} />} 
        label="Co-Own Opportunities"
        to="/dashboard/co-ownership-opportunities" 
        isActive={isActive('/dashboard/co-ownership-opportunities')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Search size={18} />} 
        label="Find Property"
        to="/dashboard/find-property" 
        isActive={isActive('/dashboard/find-property')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<MessageSquare size={18} />} 
        label="Messages"
        to="/dashboard/chats" 
        isActive={isActive('/dashboard/chats')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Wallet size={18} />} 
        label="Wallet"
        to="/dashboard/wallet" 
        isActive={isActive('/dashboard/wallet')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Scale size={18} />} 
        label="Legal Assistant"
        to="/dashboard/legal-assistant" 
        isActive={isActive('/dashboard/legal-assistant')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Settings size={18} />} 
        label="Settings"
        to="/dashboard/settings" 
        isActive={isActive('/dashboard/settings')}
      />
    </>
  );
}
