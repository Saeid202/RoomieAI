
import {
  LayoutDashboard,
  Users,
  FileText,
  Hammer,
  Sparkles,
  Cog
} from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";
import { useSidebar } from "@/components/ui/sidebar";

interface AdminSidebarProps {
  isActive: (path: string) => boolean;
  showLabels?: boolean;
}

export function AdminSidebar({ isActive, showLabels }: AdminSidebarProps) {
  const { open } = useSidebar();
  return (
    <>
      {(open || showLabels) && (
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Administration
          </h2>
        </div>
      )}
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        to="/dashboard/admin"
        icon={<LayoutDashboard size={20} />}
        label="Dashboard"
        isActive={isActive('/dashboard/admin')}
      />
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        to="/dashboard/admin/pages"
        icon={<FileText size={20} />}
        label="Pages"
        isActive={isActive('/dashboard/admin/pages')}
      />
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        to="/dashboard/admin/users"
        icon={<Users size={20} />}
        label="User Management"
        isActive={isActive('/dashboard/admin/users')}
      />
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        to="/dashboard/admin/renovation-partners"
        icon={<Hammer size={20} />}
        label="Renovation Partners"
        isActive={isActive('/dashboard/admin/renovation-partners')}
      />
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        to="/dashboard/admin/cleaners"
        icon={<Sparkles size={20} />}
        label="Cleaners"
        isActive={isActive('/dashboard/admin/cleaners')}
      />
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        to="/dashboard/admin/settings"
        icon={<Cog size={20} />}
        label="Settings"
        isActive={isActive('/dashboard/admin/settings')}
      />
    </>
  );
}
