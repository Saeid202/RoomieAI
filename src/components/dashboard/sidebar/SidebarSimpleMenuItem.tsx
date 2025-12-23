
import { Link } from "react-router-dom";
import { ReactNode } from "react";
import {
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

import { useSidebar } from "@/components/ui/sidebar";

interface SidebarSimpleMenuItemProps {
  icon: ReactNode;
  label: string;
  to: string;
  isActive: boolean;
  showLabel?: boolean;
}

export function SidebarSimpleMenuItem({
  icon,
  label,
  to,
  isActive,
  showLabel
}: SidebarSimpleMenuItemProps) {
  const { open } = useSidebar();
  return (
    <SidebarMenuItem>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <SidebarMenuButton asChild isActive={isActive} className="font-semibold">
            <Link to={to} className="flex items-center gap-3">
              {icon}
              {(open || showLabel) && <span className="font-semibold">{label}</span>}
            </Link>
          </SidebarMenuButton>
        </TooltipTrigger>

        {!open && (
          <TooltipContent side="right" align="center">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </SidebarMenuItem>
  );
}
