
import { Link } from "react-router-dom";
import { Building, Home, Settings, Users, MessageCircle, Scale, Hammer, Sparkles, ShoppingCart, DollarSign, Wallet, Zap, AlertTriangle } from "lucide-react";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";
import { SidebarMenuSection } from "./SidebarMenuSection";

interface LandlordSidebarProps {
  isActive: (path: string) => boolean;
  showLabels?: boolean;
}

export function LandlordSidebar({ isActive, showLabels }: LandlordSidebarProps) {
  return (
    <>
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Home size={18} />}
        label="Dashboard"
        to="/dashboard/landlord"
        isActive={isActive('/dashboard/landlord')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Building size={18} />}
        label="My Properties"
        to="/dashboard/landlord/properties"
        isActive={isActive('/dashboard/landlord/properties')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Users size={18} />}
        label="Applications"
        to="/dashboard/landlord/applications"
        isActive={isActive('/dashboard/landlord/applications')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<MessageCircle size={18} />}
        label="Messages"
        to="/dashboard/chats"
        isActive={isActive('/dashboard/chats')}
      />

      <SidebarMenuSection
        showLabels={showLabels}
        title="Legal AI"
        icon={Scale}
        isActive={isActive}
        subItems={[
          { label: "Legal Chat", path: "/dashboard/legal-ai" },
          { label: "🏗️ Compliance AI", path: "/dashboard/property-compliance-ai" },
          { label: "🚪 Eviction Assistant", path: "/dashboard/eviction-assistant" }
        ]}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Hammer size={18} />}
        label="Renovators"
        to="/dashboard/renovators"
        isActive={isActive('/dashboard/renovators')}
      />



      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Sparkles size={18} />}
        label="Cleaners"
        to="/dashboard/cleaners"
        isActive={isActive('/dashboard/cleaners')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🏠</span>}
        label="Equip Your Rental Property"
        to="/dashboard/shop"
        isActive={isActive('/dashboard/shop')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Settings size={18} />}
        label="Settings"
        to="/dashboard/settings"
        isActive={isActive('/dashboard/settings')}
      />
    </>
  );
}
