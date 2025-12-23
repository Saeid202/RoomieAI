
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LucideIcon } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar
} from "@/components/ui/sidebar";

interface MenuSubItem {
  label: string;
  path: string;
}

interface SidebarMenuSectionProps {
  title: string;
  icon: LucideIcon;
  subItems: MenuSubItem[];
  isActive: (path: string) => boolean;
  defaultExpanded?: boolean;
  showLabels?: boolean;
}

export function SidebarMenuSection({
  title,
  icon: Icon,
  subItems,
  isActive,
  defaultExpanded = true,
  showLabels
}: SidebarMenuSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { open } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setExpanded(!expanded)}
        className="justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon size={20} />
          {(open || showLabels) && <span>{title}</span>}
        </div>
        {(open || showLabels) && (
          <ChevronDown
            size={16}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </SidebarMenuButton>

      {expanded && (
        <SidebarMenuSub>
          {subItems.map((item) => (
            <SidebarMenuSubItem key={item.path}>
              <SidebarMenuSubButton asChild isActive={isActive(item.path)}>
                <Link to={item.path}>
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
