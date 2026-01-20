
import { Link } from "react-router-dom";
import { LogOut, Settings, ChevronDown, Home, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/contexts/RoleContext";
import { useSidebar } from "@/components/ui/sidebar";
import { RoleSwitcher } from "./RoleSwitcher";
import { NotificationBell } from "../notifications/NotificationBell";

export function UserMenu() {
  const { user, signOut, updateMetadata } = useAuth();
  const { role, setRole } = useRole();
  const { toggleSidebar } = useSidebar();
  // Role switching is now handled by RoleSwitcher component

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="font-semibold"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>



        {/* Notifications */}
        <NotificationBell />


        <div className="block md:hidden">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Roomie AI
          </h2>
        </div>
      </div>

      {/* Role switching is now handled by RoleSwitcher component */}
    </div>
  );
}
