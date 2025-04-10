
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

interface SidebarSimpleMenuItemProps {
  title: string;
  icon: LucideIcon;
  path: string;
  isActive: (path: string) => boolean;
}

export function SidebarSimpleMenuItem({
  title,
  icon: Icon,
  path,
  isActive
}: SidebarSimpleMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive(path)}>
        <Link to={path}>
          <Icon size={20} />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
