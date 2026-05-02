import {
  LayoutDashboard, User, Building2, FileText, CalendarDays,
  CreditCard, Scale, Hammer, GraduationCap, MessageCircle, Settings,
  Gavel, ShieldCheck, DoorOpen, TrendingUp, Wrench, Sparkles
} from "lucide-react";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";
import { SidebarMenuSection } from "./SidebarMenuSection";

interface LandlordSidebarProps {
  isActive: (path: string) => boolean;
  showLabels?: boolean;
}

export function LandlordSidebar({ isActive, showLabels }: LandlordSidebarProps) {
  return (
    <div className="flex flex-col gap-0.5 py-2 px-2">
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<LayoutDashboard className="h-4 w-4" />}
        label="Dashboard"
        to="/dashboard/landlord"
        isActive={isActive('/dashboard/landlord')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<User className="h-4 w-4" />}
        label="Profile"
        to="/dashboard/landlord/profile"
        isActive={isActive('/dashboard/landlord/profile')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Building2 className="h-4 w-4" />}
        label="My Properties"
        to="/dashboard/landlord/properties"
        isActive={isActive('/dashboard/landlord/properties')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<FileText className="h-4 w-4" />}
        label="Applications"
        to="/dashboard/landlord/applications"
        isActive={isActive('/dashboard/landlord/applications')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<CalendarDays className="h-4 w-4" />}
        label="Viewing Appointments"
        to="/dashboard/landlord/viewing-appointments"
        isActive={isActive('/dashboard/landlord/viewing-appointments')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<CreditCard className="h-4 w-4" />}
        label="Payments"
        to="/dashboard/landlord/payments"
        isActive={isActive('/dashboard/landlord/payments')}
      />

      <SidebarMenuSection
        showLabels={showLabels}
        title="Legal AI"
        icon={() => <Scale className="h-4 w-4" />}
        isActive={isActive}
        subItems={[
          { label: "Legal Chat", path: "/dashboard/legal-ai", icon: <Gavel className="h-3.5 w-3.5" /> },
          { label: "Compliance AI", path: "/dashboard/property-compliance-ai", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
          { label: "Eviction Assistant", path: "/dashboard/eviction-assistant", icon: <DoorOpen className="h-3.5 w-3.5" /> },
          { label: "Tax Intelligence", path: "/dashboard/tax-intelligence", icon: <TrendingUp className="h-3.5 w-3.5" /> },
        ]}
      />

      <SidebarMenuSection
        showLabels={showLabels}
        title="Service Companies"
        icon={() => <Wrench className="h-4 w-4" />}
        isActive={isActive}
        subItems={[
          { label: "Partnered Renovators", path: "/dashboard/renovators", icon: <Hammer className="h-3.5 w-3.5" /> },
          { label: "Partnered Cleaners", path: "/dashboard/cleaners", icon: <Sparkles className="h-3.5 w-3.5" /> },
        ]}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<GraduationCap className="h-4 w-4" />}
        label="Education Centre"
        to="/dashboard/education-centre"
        isActive={isActive('/dashboard/education-centre')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<MessageCircle className="h-4 w-4" />}
        label="Messages"
        to="/dashboard/chats"
        isActive={isActive('/dashboard/chats')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Settings className="h-4 w-4" />}
        label="Settings"
        to="/dashboard/settings"
        isActive={isActive('/dashboard/settings')}
      />
    </div>
  );
}
