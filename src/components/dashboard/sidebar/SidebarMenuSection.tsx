import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface MenuSubItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface SidebarMenuSectionProps {
  title: string;
  icon: any;
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
  showLabels,
}: SidebarMenuSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { open, isMobile, openMobile, setOpenMobile } = useSidebar();
  const shouldShowLabel = open || showLabels || (isMobile && openMobile);
  const anyActive = subItems.some((item) => isActive(item.path));
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  function handleNavClick(e: React.MouseEvent, path: string) {
    e.preventDefault();
    if (isMobile && openMobile) setOpenMobile(false);
    startTransition(() => {
      navigate(path);
    });
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[17px] font-semibold transition-all duration-150",
          anyActive && !expanded
            ? "text-violet-700 bg-violet-50"
            : "text-black hover:bg-violet-50 hover:text-violet-700"
        )}
      >
        <span className={cn("shrink-0 text-[18px] leading-none", anyActive ? "opacity-100" : "opacity-100")}>
          {typeof Icon === "function" ? <Icon size={17} /> : Icon}
        </span>
        {shouldShowLabel && (
          <>
            <span className="truncate flex-1 text-left">{title}</span>
            <ChevronDown
              size={14}
              className={cn("shrink-0 text-slate-400 transition-transform duration-200", expanded && "rotate-180")}
            />
          </>
        )}
      </button>

      {expanded && shouldShowLabel && (
        <div className="ml-4 flex flex-col gap-0.5">
          {subItems.map((item) => {
            const active = isActive(item.path);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[16px] transition-all duration-150",
                  active
                    ? "bg-violet-100 text-violet-700 font-semibold"
                    : "text-gray-900 hover:bg-violet-50 hover:text-violet-600"
                )}
              >
                {item.icon && (
                  <span className={cn("text-sm leading-none", active ? "opacity-100" : "opacity-60")}>
                    {item.icon}
                  </span>
                )}
                <span className="truncate">{item.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
