
import { Link } from "react-router-dom";
import { ReactNode } from "react";
import {
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

interface SidebarSimpleMenuItemProps {
  icon: ReactNode;
  label: string;
  to: string;
  isActive: boolean;
}

export function SidebarSimpleMenuItem({
  icon,
  label,
  to,
  isActive
}: SidebarSimpleMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} className="font-semibold">
        <Link to={to}>
          {icon}
          <span className="font-semibold">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
