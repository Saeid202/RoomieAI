
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
  icon?: React.ReactNode;
}

interface SidebarMenuSectionProps {
  title: string;
  icon: any; // Allow customized icons including emojis
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
  defaultExpanded = false,
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
          {typeof Icon === 'function' || typeof Icon === 'object' ? <Icon size={20} /> : Icon}
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
                <Link to={item.path} className="flex items-center gap-2">
                  {item.icon && <span className="opacity-70">{item.icon}</span>}
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
