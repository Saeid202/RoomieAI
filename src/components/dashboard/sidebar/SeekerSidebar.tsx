
import { Link } from "react-router-dom";
import { 
  Home, Users, Building, Search, MessageSquare, 
  Settings, Calendar, Clock, List, MapPin, Group, 
  Briefcase, Flag, Scale, Sliders
} from "lucide-react";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;
import { useAuth } from "@/hooks/useAuth";

interface SeekerSidebarProps {
  isActive: (path: string) => boolean;
}

export function SeekerSidebar({ isActive }: SeekerSidebarProps) {
  const { user } = useAuth();
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    let channel: any;
    const load = async () => {
      if (!user) return;
      // compute unread by counting messages newer than last_read_at per conversation
      const { data: convs } = await sb
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', user.id);

      if (!convs || convs.length === 0) {
        setUnread(0);
        return;
      }

      const convIds = convs.map((c: any) => c.conversation_id);
      const lastReadMap = new Map<string, string | null>();
      convs.forEach((c: any) => lastReadMap.set(c.conversation_id, c.last_read_at));

      const { data: counts } = await sb
        .from('messages')
        .select('conversation_id, created_at')
        .in('conversation_id', convIds);

      if (!counts) { setUnread(0); return; }
      const total = counts.reduce((acc: number, m: any) => {
        const lr = lastReadMap.get(m.conversation_id);
        if (!lr || new Date(m.created_at) > new Date(lr)) return acc + 1;
        return acc;
      }, 0);
      setUnread(total);

      // subscribe for live increments
      channel = sb.channel('sidebar_unread')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => load())
        .subscribe();
    };
    load();
    return () => { if (channel) sb.removeChannel(channel); };
  }, [user?.id]);
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
        icon={<MessageSquare size={18} />} 
        label={`Messenger${unread > 0 ? ` (${unread})` : ''}`}
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
