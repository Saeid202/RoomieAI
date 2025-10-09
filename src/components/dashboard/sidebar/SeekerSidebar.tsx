
import { Link } from "react-router-dom";
import { 
  Home, Users, Building, Search, 
  Settings, Calendar, Clock, List, MapPin, Group, 
  Briefcase, Flag, Scale, Sliders, Bot
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
        label="Matches"
        to="/dashboard/matches" 
        isActive={isActive('/dashboard/matches')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Building size={18} />} 
        label="Rental Options"
        to="/dashboard/rental-options" 
        isActive={isActive('/dashboard/rental-options')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<List size={18} />} 
        label="My Applications"
        to="/dashboard/applications" 
        isActive={isActive('/dashboard/applications')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Calendar size={18} />} 
        label="Plan Ahead Matching"
        to="/dashboard/plan-ahead-matching" 
        isActive={isActive('/dashboard/plan-ahead-matching')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Clock size={18} />} 
        label="Opposite Schedule"
        to="/dashboard/opposite-schedule" 
        isActive={isActive('/dashboard/opposite-schedule')}
      />
      
      
      <SidebarSimpleMenuItem 
        icon={<Briefcase size={18} />} 
        label="Work Exchange"
        to="/dashboard/work-exchange" 
        isActive={isActive('/dashboard/work-exchange')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Flag size={18} />} 
        label="LGBTQ+ Matching"
        to="/dashboard/lgbtq-matching" 
        isActive={isActive('/dashboard/lgbtq-matching')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Bot size={18} />} 
        label="Tailor AI"
        to="/dashboard/tailor-ai" 
        isActive={isActive('/dashboard/tailor-ai')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Scale size={18} />} 
        label="AI Legal Assistant"
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
