import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "./RoleSwitcher";
import { useRole } from "@/contexts/RoleContext";
import { SeekerSidebar } from "./sidebar/SeekerSidebar";
import { LandlordSidebar } from "./sidebar/LandlordSidebar";
import { DeveloperSidebar } from "./sidebar/DeveloperSidebar";
import { AdminSidebar } from "./sidebar/AdminSidebar";
import { RenovatorSidebar } from "./sidebar/RenovatorSidebar";
import { MortgageBrokerSidebar } from "./sidebar/MortgageBrokerSidebar";
import { LawyerSidebar } from "./sidebar/LawyerSidebar";
import { LenderSidebar } from "./sidebar/LenderSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { ChevronUp, Settings, LogOut, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardSidebar() {
  const location = useLocation();
  const { role } = useRole();
  const { open, toggleSidebar, isMobile } = useSidebar();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar collapsible="offcanvas" defaultOpen={!isMobile} className="border-r border-slate-200 shadow-[2px_0_16px_rgba(139,92,246,0.08)]">
      {/* Header */}
      <SidebarHeader className="px-5 py-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-400 to-violet-600 p-2.5 rounded-xl shadow-md shadow-violet-200 shrink-0">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight leading-none mb-0.5 bg-gradient-to-r from-orange-500 to-violet-600 bg-clip-text text-transparent">
              Homie AI
            </h2>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              {role?.replace('_', ' ') || 'Dashboard'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-3 bg-white">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {(() => {
                if (location.pathname.includes('/dashboard/admin')) return <AdminSidebar isActive={isActive} />;
                if (location.pathname.includes('/dashboard/landlord')) return <LandlordSidebar isActive={isActive} />;
                if (location.pathname.includes('/renovator/')) return <RenovatorSidebar isActive={isActive} />;
                if (location.pathname.includes('/dashboard/mortgage-broker')) return <MortgageBrokerSidebar isActive={isActive} />;
                if (location.pathname.includes('/dashboard/lawyer')) return <LawyerSidebar isActive={isActive} />;
                if (location.pathname.includes('/dashboard/lender')) return <LenderSidebar isActive={isActive} />;

                const isSeekerRoute =
                  location.pathname.startsWith('/dashboard/roommate-recommendations') ||
                  location.pathname.startsWith('/dashboard/ideal-roommate') ||
                  location.pathname.startsWith('/dashboard/rental-options') ||
                  location.pathname.startsWith('/dashboard/buying-opportunities') ||
                  location.pathname.startsWith('/dashboard/buy/') ||
                  location.pathname.startsWith('/dashboard/rent/') ||
                  location.pathname.startsWith('/dashboard/co-ownership/') ||
                  location.pathname.startsWith('/dashboard/co-ownership-profile') ||
                  location.pathname.startsWith('/dashboard/applications') ||
                  location.pathname.startsWith('/dashboard/profile') && !location.pathname.includes('/landlord/') && !location.pathname.includes('/lawyer/');

                if (isSeekerRoute) return <SeekerSidebar isActive={isActive} />;

                if (role === 'admin') return <AdminSidebar isActive={isActive} />;
                if (role === 'landlord') return <LandlordSidebar isActive={isActive} />;
                if (role === 'renovator') return <RenovatorSidebar isActive={isActive} />;
                if (role === 'mortgage_broker') return <MortgageBrokerSidebar isActive={isActive} />;
                if (role === 'lawyer') return <LawyerSidebar isActive={isActive} />;
                if (role === 'lender') return <LenderSidebar isActive={isActive} />;
                if (role === 'developer') return <LandlordSidebar isActive={isActive} />;

                return <SeekerSidebar isActive={isActive} />;
              })()}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-3 py-4 border-t border-slate-100 bg-white">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 h-auto py-2.5 gap-3 rounded-xl hover:bg-violet-50 text-slate-600 hover:text-violet-700 transition-all"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-400 to-violet-600 flex items-center justify-center text-white font-black shrink-0 text-sm shadow-md shadow-violet-200">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col items-start text-left min-w-0 flex-1 overflow-hidden">
                <span className="text-sm font-semibold truncate w-full text-slate-700">{user?.email?.split('@')[0]}</span>
                <span className="text-[11px] text-slate-400 truncate w-full">{user?.email}</span>
              </div>
              <ChevronUp className="h-4 w-4 shrink-0 text-slate-300" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side="top" sideOffset={8}>
            <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings" className="w-full cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" className="w-full justify-start gap-3 px-3 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 text-sm" asChild>
          <Link to="/">
            <Home className="h-4 w-4 shrink-0" />
            <span>Back to Home</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
