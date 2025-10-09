
import { Link } from "react-router-dom";
import { Building, Home, Settings, Users, MessageCircle } from "lucide-react";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface LandlordSidebarProps {
  isActive: (path: string) => boolean;
}

export function LandlordSidebar({ isActive }: LandlordSidebarProps) {
  return (
    <>
      <SidebarSimpleMenuItem 
        icon={<Home size={18} />} 
        label="Dashboard"
        to="/dashboard/landlord" 
        isActive={isActive('/dashboard/landlord')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Building size={18} />} 
        label="My Properties"
        to="/dashboard/landlord/properties" 
        isActive={isActive('/dashboard/landlord/properties')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Users size={18} />} 
        label="Applications"
        to="/dashboard/landlord/applications" 
        isActive={isActive('/dashboard/landlord/applications')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<MessageCircle size={18} />} 
        label="Messages"
        to="/dashboard/chats" 
        isActive={isActive('/dashboard/chats')}
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
