
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Cog
} from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface AdminSidebarProps {
  isActive: (path: string) => boolean;
}

export function AdminSidebar({ isActive }: AdminSidebarProps) {
  return (
    <>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Administration</h2>
        <div className="space-y-1">
          <SidebarSimpleMenuItem 
            to="/dashboard/admin"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            isActive={isActive('/dashboard/admin')}
          />
          <SidebarSimpleMenuItem 
            to="/dashboard/admin/pages"
            icon={<FileText size={20} />}
            label="Pages"
            isActive={isActive('/dashboard/admin/pages')}
          />
          <SidebarSimpleMenuItem 
            to="/dashboard/admin/users"
            icon={<Users size={20} />}
            label="User Management"
            isActive={isActive('/dashboard/admin/users')}
          />
          <SidebarSimpleMenuItem 
            to="/dashboard/admin/settings"
            icon={<Cog size={20} />}
            label="Settings"
            isActive={isActive('/dashboard/admin/settings')}
          />
        </div>
      </div>
    </>
  );
}
