
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Cog
} from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuSection } from "./SidebarMenuSection";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface AdminSidebarProps {
  isActive: (path: string) => boolean;
}

export function AdminSidebar({ isActive }: AdminSidebarProps) {
  return (
    <>
      <SidebarMenuSection label="Administration">
        <SidebarSimpleMenuItem 
          href="/dashboard/admin"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          isActive={isActive('/dashboard/admin')}
        />
        <SidebarSimpleMenuItem 
          href="/dashboard/admin/pages"
          icon={<FileText size={20} />}
          label="Pages"
          isActive={isActive('/dashboard/admin/pages')}
        />
        <SidebarSimpleMenuItem 
          href="/dashboard/admin/users"
          icon={<Users size={20} />}
          label="User Management"
          isActive={isActive('/dashboard/admin/users')}
        />
        <SidebarSimpleMenuItem 
          href="/dashboard/admin/settings"
          icon={<Cog size={20} />}
          label="Settings"
          isActive={isActive('/dashboard/admin/settings')}
        />
      </SidebarMenuSection>
    </>
  );
}
