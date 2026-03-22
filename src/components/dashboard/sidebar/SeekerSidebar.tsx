
import { Link, useLocation } from "react-router-dom";
import {
  Home, Users, Building, Search, User, Heart,
  Settings, Calendar, Clock, List, MapPin, Group,
  Briefcase, Flag, Scale, Sliders, Bot, CreditCard, MessageSquare, Hammer, GraduationCap, Tags
} from "lucide-react";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";
import { SidebarMenuSection } from "./SidebarMenuSection";

interface SeekerSidebarProps {
  isActive: (path: string) => boolean;
  showLabels?: boolean;
}

export function SeekerSidebar({ isActive, showLabels }: SeekerSidebarProps) {
  const location = useLocation();
  return (
    <>
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🏠</span>}
        label="Dashboard"
        to="/dashboard"
        isActive={isActive('/dashboard')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">👤</span>}
        label="Profile"
        to="/dashboard/profile"
        isActive={isActive('/dashboard/profile')}
      />

      <SidebarMenuSection
        showLabels={showLabels}
        title="Matches"
        icon={() => <span className="text-lg">🤝</span>}
        isActive={isActive}
        defaultExpanded={
          location.pathname.includes('/dashboard/matches') ||
          location.pathname.includes('/dashboard/plan-ahead-matching') ||
          location.pathname.includes('/dashboard/opposite-schedule') ||
          location.pathname.includes('/dashboard/work-exchange')
        }
        subItems={[
          {
            label: "Ideal Roommate",
            path: "/dashboard/matches?tab=ideal-roommate",
            icon: <span className="text-sm">❤️</span>
          },
          {
            label: "View Matches",
            path: "/dashboard/matches?tab=matches",
            icon: <span className="text-sm">🔍</span>
          },
          {
            label: "Plan Ahead",
            path: "/dashboard/plan-ahead-matching",
            icon: <span className="text-sm">📅</span>
          },
          {
            label: "Opposite Schedule",
            path: "/dashboard/opposite-schedule",
            icon: <span className="text-sm">🌙</span>
          },
          {
            label: "Work Exchange",
            path: "/dashboard/work-exchange",
            icon: <span className="text-sm">💼</span>
          }
        ]}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🏢</span>}
        label="Rental Options"
        to="/dashboard/rental-options"
        isActive={isActive('/dashboard/rental-options')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">📑</span>}
        label="My Applications"
        to="/dashboard/applications"
        isActive={isActive('/dashboard/applications')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">💳</span>}
        label="Digital Wallet"
        to="/dashboard/digital-wallet"
        isActive={isActive('/dashboard/digital-wallet')}
      />

      <SidebarMenuSection
        showLabels={showLabels}
        title="Buying Opportunities"
        icon={() => <span className="text-lg">🏘️</span>}
        isActive={isActive}
        defaultExpanded={
          location.pathname.includes('/dashboard/buying-opportunities') ||
          location.pathname.includes('/dashboard/co-ownership-matches')
        }
        subItems={[
          {
            label: "Co-ownership",
            path: "/dashboard/buying-opportunities?tab=co-ownership",
            icon: <span className="text-sm">🤝</span>
          },
          {
            label: "Matches",
            path: "/dashboard/co-ownership-matches",
            icon: <span className="text-sm">👥</span>
          },
          {
            label: "Buy Unit",
            path: "/dashboard/buying-opportunities?tab=sales",
            icon: <span className="text-sm">🏠</span>
          },
          {
            label: "Mortgage Profile",
            path: "/dashboard/buying-opportunities?tab=mortgage-profile",
            icon: <span className="text-sm">💰</span>
          }
        ]}
      />



      {/* Temporarily hidden - Tailor AI tab */}
      {/* <SidebarSimpleMenuItem 
        showLabel={showLabels}
        icon={<Bot size={18} />} 
        label="Tailor AI"
        to="/dashboard/tailor-ai" 
        isActive={isActive('/dashboard/tailor-ai')}
      /> */}

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🛠️</span>}
        label="Renovators"
        to="/dashboard/renovators"
        isActive={isActive('/dashboard/renovators')}
      />



      <SidebarMenuSection
        showLabels={showLabels}
        title="Legal"
        icon={() => <span className="text-lg">⚖️</span>}
        isActive={isActive}
        defaultExpanded={
          location.pathname.includes('/dashboard/tenancy-legal-ai') ||
          location.pathname.includes('/dashboard/find-lawyer')
        }
        subItems={[
          {
            label: "AI Legal Assistant",
            path: "/dashboard/tenancy-legal-ai",
            icon: <span className="text-sm">🤖</span>
          },
          {
            label: "Contact Lawyer",
            path: "/dashboard/find-lawyer",
            icon: <span className="text-sm">👨‍⚖️</span>
          }
        ]}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🎓</span>}
        label="Education Centre"
        to="/dashboard/education-centre"
        isActive={isActive('/dashboard/education-centre')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">💬</span>}
        label="Messenger"
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
