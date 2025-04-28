
import { Building, ChartBar, Home, MessageSquare, Settings, Users } from "lucide-react";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface DeveloperSidebarProps {
  isActive: (path: string) => boolean;
}

export function DeveloperSidebar({ isActive }: DeveloperSidebarProps) {
  return (
    <>
      <SidebarSimpleMenuItem 
        icon={<Home size={18} />} 
        label="Dashboard"
        to="/dashboard/developer" 
        isActive={isActive('/dashboard/developer')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Building size={18} />} 
        label="My Properties"
        to="/dashboard/developer/properties" 
        isActive={isActive('/dashboard/developer/properties')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<ChartBar size={18} />} 
        label="Market Analysis"
        to="/dashboard/developer/market" 
        isActive={isActive('/dashboard/developer/market')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Users size={18} />} 
        label="Buyer Inquiries"
        to="/dashboard/developer/inquiries" 
        isActive={isActive('/dashboard/developer/inquiries')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<MessageSquare size={18} />} 
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
