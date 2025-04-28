
import { 
  Home, 
  Search, 
  Users, 
  Building, 
  MessageSquare, 
  Scale, 
  Wallet, 
  Settings, 
  User
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
        label="Home"
        to="/dashboard" 
        isActive={isActive('/dashboard')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<User size={18} />} 
        label="My Profile"
        to="/dashboard/profile" 
        isActive={isActive('/dashboard/profile')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Users size={18} />} 
        label="Roommate Recommendations"
        to="/dashboard/roommate-recommendations" 
        isActive={isActive('/dashboard/roommate-recommendations')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Building size={18} />} 
        label="Rent Opportunities"
        to="/dashboard/rent-opportunities" 
        isActive={isActive('/dashboard/rent-opportunities')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Building size={18} />} 
        label="Co-Owner Recommendations"
        to="/dashboard/co-owner-recommendations" 
        isActive={isActive('/dashboard/co-owner-recommendations')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Building size={18} />} 
        label="Ownership Opportunities"
        to="/dashboard/co-ownership-opportunities" 
        isActive={isActive('/dashboard/co-ownership-opportunities')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<MessageSquare size={18} />} 
        label="Chats"
        to="/dashboard/chats" 
        isActive={isActive('/dashboard/chats')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Scale size={18} />} 
        label="Legal Assistant"
        to="/dashboard/legal-assistant" 
        isActive={isActive('/dashboard/legal-assistant')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Wallet size={18} />} 
        label="Wallet"
        to="/dashboard/wallet" 
        isActive={isActive('/dashboard/wallet')}
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
