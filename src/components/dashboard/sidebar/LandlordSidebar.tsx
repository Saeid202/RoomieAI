
import { Link } from "react-router-dom";
import { Building, Home, Settings, Users, MessageCircle, Scale, Hammer, Sparkles, ShoppingCart, DollarSign, Wallet, Zap, AlertTriangle } from "lucide-react";
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
        icon={<DollarSign size={18} />} 
        label="Rent Collection"
        to="/dashboard/rent-collection" 
        isActive={isActive('/dashboard/rent-collection')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<MessageCircle size={18} />} 
        label="Messages"
        to="/dashboard/chats" 
        isActive={isActive('/dashboard/chats')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Scale size={18} />} 
        label="Legal AI"
        to="/dashboard/legal-ai" 
        isActive={isActive('/dashboard/legal-ai')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Hammer size={18} />} 
        label="Renovators"
        to="/dashboard/renovators" 
        isActive={isActive('/dashboard/renovators')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Sparkles size={18} />} 
        label="Cleaners"
        to="/dashboard/cleaners" 
        isActive={isActive('/dashboard/cleaners')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<ShoppingCart size={18} />} 
        label="Shop for Your Home"
        to="/dashboard/shop" 
        isActive={isActive('/dashboard/shop')}
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
