
import { Link } from "react-router-dom";
import {
  Home, Users, Building, Search,
  Settings, Calendar, Clock, List, MapPin, Group,
  Briefcase, Flag, Scale, Sliders, Bot, CreditCard, MessageSquare
} from "lucide-react";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface SeekerSidebarProps {
  isActive: (path: string) => boolean;
  showLabels?: boolean;
}

export function SeekerSidebar({ isActive, showLabels }: SeekerSidebarProps) {
  return (
    <>
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Home size={18} />}
        label="Dashboard"
        to="/dashboard"
        isActive={isActive('/dashboard')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Users size={18} />}
        label="Matches"
        to="/dashboard/matches"
        isActive={isActive('/dashboard/matches')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Building size={18} />}
        label="Rental Options"
        to="/dashboard/rental-options"
        isActive={isActive('/dashboard/rental-options')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<List size={18} />}
        label="My Applications"
        to="/dashboard/applications"
        isActive={isActive('/dashboard/applications')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<MessageSquare size={18} />}
        label="Messages"
        to="/dashboard/chats"
        isActive={isActive('/dashboard/chats')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Calendar size={18} />}
        label="Plan Ahead Matching"
        to="/dashboard/plan-ahead-matching"
        isActive={isActive('/dashboard/plan-ahead-matching')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Clock size={18} />}
        label="Opposite Schedule"
        to="/dashboard/opposite-schedule"
        isActive={isActive('/dashboard/opposite-schedule')}
      />


      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Briefcase size={18} />}
        label="Work Exchange"
        to="/dashboard/work-exchange"
        isActive={isActive('/dashboard/work-exchange')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Flag size={18} />}
        label="LGBTQ+ Matching"
        to="/dashboard/lgbtq-matching"
        isActive={isActive('/dashboard/lgbtq-matching')}
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
        icon={<MessageSquare size={18} />}
        label="Messenger"
        to="/dashboard/chats"
        isActive={isActive('/dashboard/chats')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<Scale size={18} />}
        label="AI Legal Assistant"
        to="/dashboard/tenancy-legal-ai"
        isActive={isActive('/dashboard/tenancy-legal-ai')}
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
