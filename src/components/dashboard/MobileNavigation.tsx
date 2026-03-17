import {
  Home,
  Search,
  MessageSquare,
  Building,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { MobileSidebarSheet } from "./MobileSidebarSheet";

export function MobileNavigation() {
  const { role: baseRole } = useRole();
  const location = useLocation();

  // Context-aware role detection
  const isSeekerRoute =
    location.pathname.startsWith('/dashboard/roommate-recommendations') ||
    location.pathname.startsWith('/dashboard/matches') ||
    location.pathname.startsWith('/dashboard/rental-options') ||
    location.pathname.startsWith('/dashboard/buying-opportunities') ||
    location.pathname.startsWith('/dashboard/buy/') ||
    location.pathname.startsWith('/dashboard/rent/') ||
    location.pathname.startsWith('/dashboard/co-ownership/') ||
    location.pathname.startsWith('/dashboard/applications');

  const role = (isSeekerRoute && baseRole !== 'landlord' && baseRole !== 'admin') ? 'seeker' : baseRole;

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Determine role-specific routes
  const getHomeRoute = () => {
    switch (role) {
      case "landlord":
        return "/dashboard/landlord";
      case "developer":
        return "/dashboard/landlord";
      case "renovator":
        return "/renovator/dashboard";
      case "mortgage_broker":
        return "/dashboard/mortgage-broker";
      case "lawyer":
        return "/dashboard/lawyer";
      case "lender":
        return "/dashboard/lender";
      default:
        return "/dashboard/roommate-recommendations";
    }
  };

  const getRentRoommateRoute = () => {
    return role === "seeker" ? "/dashboard/matches" : "/dashboard/landlord";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm border-t border-border/20 z-40 md:hidden pb-safe">
      {/* Modern glass morphism navigation bar */}
      <div className="px-2 py-3">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          <NavItem
            icon={<Home size={22} />}
            label="Home"
            to={getHomeRoute()}
            isActive={isActive(getHomeRoute())}
          />

          <NavItem
            icon={<MessageSquare size={22} />}
            label={role === "landlord" ? "Messages" : role === "lawyer" ? "Messenger" : role === "mortgage_broker" ? "Feedback" : "Legal AI"}
            to={role === "landlord" || role === "lawyer" ? "/dashboard/chats" : "/dashboard/legal-assistant"}
            isActive={role === "landlord" || role === "lawyer" ? isActive("/dashboard/chats") : isActive("/dashboard/legal-assistant")}
          />



          {role === "seeker" && (
            <>
              <NavItem
                icon={<Search size={22} />}
                label={"Matches"}
                to={"/dashboard/matches"}
                isActive={isActive("/dashboard/matches")}
              />
              <NavItem
                icon={<Building size={22} />}
                label={"Rentals"}
                to={"/dashboard/rental-options"}
                isActive={isActive("/dashboard/rental-options")}
              />
            </>
          )}

          <MobileSidebarSheet />
        </div>
      </div>

      {/* Safe area indicator */}
      <div className="h-safe bg-white"></div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  to,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
}) {
  return (
    <Link
      to={to}
      className={`
        relative flex flex-col items-center justify-center 
        py-2 px-3 rounded-xl transition-all duration-300 active:scale-95
        ${isActive
          ? "text-primary bg-primary/10 shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
        }
      `}
    >
      <div
        className={`
        p-1 rounded-lg transition-all duration-300
        ${isActive ? "bg-primary/20" : ""}
      `}
      >
        {icon}
      </div>
      <span
        className={`
        text-xs mt-1 font-bold transition-all duration-300
        ${isActive ? "text-primary" : ""}
      `}
      >
        {label}
      </span>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
      )}
    </Link>
  );
}


