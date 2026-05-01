import { useNavigate } from "react-router-dom";
import { ReactNode, useTransition } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarSimpleMenuItemProps {
  icon: ReactNode;
  label: string;
  to: string;
  isActive: boolean;
  showLabel?: boolean;
}

export function SidebarSimpleMenuItem({ icon, label, to, isActive, showLabel }: SidebarSimpleMenuItemProps) {
  const { open, isMobile, openMobile, setOpenMobile } = useSidebar();
  const shouldShowLabel = open || showLabel || (isMobile && openMobile);
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (isMobile && openMobile) setOpenMobile(false);
    startTransition(() => {
      navigate(to);
    });
  }

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <a
          href={to}
          onClick={handleClick}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 group",
            isActive
              ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-200"
              : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
          )}
        >
          <span className={cn(
            "shrink-0 text-[17px] leading-none transition-all",
            isActive ? "opacity-100 drop-shadow-sm" : "opacity-70 group-hover:opacity-100"
          )}>
            {icon}
          </span>

          {shouldShowLabel && (
            <span className="truncate">{label}</span>
          )}

          {isActive && shouldShowLabel && (
            <span className="ml-auto h-2 w-2 rounded-full bg-white/70 shrink-0" />
          )}
        </a>
      </TooltipTrigger>
      {!shouldShowLabel && (
        <TooltipContent side="right" align="center" className="font-semibold">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
