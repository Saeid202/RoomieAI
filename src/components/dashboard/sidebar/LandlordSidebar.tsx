
import { Link } from "react-router-dom";
import { Building, Home, Settings, Users, MessageCircle, Scale, Hammer, Sparkles, ShoppingCart, DollarSign, Wallet, Zap, AlertTriangle, GraduationCap } from "lucide-react";
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
        icon={<span className="text-lg">🏠</span>}
        label="Dashboard"
        to="/dashboard/landlord"
        isActive={isActive('/dashboard/landlord')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🏢</span>}
        label="My Properties"
        to="/dashboard/landlord/properties"
        isActive={isActive('/dashboard/landlord/properties')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">📑</span>}
        label="Applications"
        to="/dashboard/landlord/applications"
        isActive={isActive('/dashboard/landlord/applications')}
      />

      <SidebarMenuSection
        showLabels={showLabels}
        title="Legal AI"
        icon={() => <span className="text-lg">⚖️</span>}
        isActive={isActive}
        subItems={[
          { label: "⚖️ Legal Chat", path: "/dashboard/legal-ai" },
          { label: "🏗️ Compliance AI", path: "/dashboard/property-compliance-ai" },
          { label: "🚪 Eviction Assistant", path: "/dashboard/eviction-assistant" }
        ]}
      />

      <SidebarMenuSection
        showLabels={showLabels}
        title="Service Companies"
        icon={() => <span className="text-lg">🏢</span>}
        isActive={isActive}
        subItems={[
          { label: "Partnered Renovators", path: "/dashboard/renovators" },
          { label: "Partnered Cleaners", path: "/dashboard/cleaners" }
        ]}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🎓</span>}
        label="Education Centre"
        to="/dashboard/education-centre"
        isActive={isActive('/dashboard/education-centre')}
      />

      {/* HIDDEN FOR NOW - Can be re-enabled later
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🛒</span>}
        label="Equip Your Rental Property"
        to="/dashboard/shop"
        isActive={isActive('/dashboard/shop')}
      />
      */}

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">💬</span>}
        label="Messages"
        to="/dashboard/chats"
        isActive={isActive('/dashboard/chats')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">⚙️</span>}
        label="Settings"
        to="/dashboard/settings"
        isActive={isActive('/dashboard/settings')}
      />
    </>
  );
}
