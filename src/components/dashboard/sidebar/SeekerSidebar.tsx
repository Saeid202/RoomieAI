
import { Link } from "react-router-dom";
import { 
  Home, Users, Building, Search, MessageSquare, 
  Settings, Calendar, Clock, List, MapPin, Group, 
  Briefcase, Flag, Scale, Sliders
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
        icon={<MapPin size={18} />} 
        label="Short Term Housing"
        to="/dashboard/short-term" 
        isActive={isActive('/dashboard/short-term')}
      />
      
      <SidebarSimpleMenuItem 
        icon={<Group size={18} />} 
        label="Group Matching"
        to="/dashboard/group-matching" 
        isActive={isActive('/dashboard/group-matching')}
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
        icon={<MessageSquare size={18} />} 
        label="Messenger"
        to="/dashboard/messenger" 
        isActive={isActive('/dashboard/messenger')}
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
