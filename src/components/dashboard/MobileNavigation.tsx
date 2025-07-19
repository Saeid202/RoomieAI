
import { Home, Search, User, MessageSquare, Users, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";

export function MobileNavigation() {
  const location = useLocation();
  const { role } = useRole();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Get navigation items based on role and authentication status
  const getNavigationItems = () => {
    // If user is not authenticated, show public navigation
    if (!user) {
      return [
        { icon: <Home size={22} />, label: "Home", to: "/" },
        { icon: <MessageSquare size={22} />, label: "About", to: "/" },
        { icon: <User size={22} />, label: "Login", to: "/auth" }
      ];
    }

    // Authenticated user navigation based on role
    switch (role) {
      case 'landlord':
        return [
          { icon: <Home size={22} />, label: "Dashboard", to: "/dashboard/landlord" },
          { icon: <Users size={22} />, label: "Applications", to: "/dashboard/landlord/applications" },
          { icon: <MessageSquare size={22} />, label: "Messages", to: "/dashboard/chats" },
          { icon: <Settings size={22} />, label: "Settings", to: "/dashboard/settings" }
        ];
      
      case 'admin':
        return [
          { icon: <Home size={22} />, label: "Dashboard", to: "/dashboard/admin" },
          { icon: <Users size={22} />, label: "Users", to: "/dashboard/admin/users" },
          { icon: <MessageSquare size={22} />, label: "Messages", to: "/dashboard/chats" },
          { icon: <Settings size={22} />, label: "Settings", to: "/dashboard/admin/settings" }
        ];
      
      default: // seeker
        return [
          { icon: <Home size={22} />, label: "Dashboard", to: "/dashboard" },
          { icon: <Users size={22} />, label: "Matches", to: "/dashboard/matches" },
          { icon: <MessageSquare size={22} />, label: "Legal AI", to: "/dashboard/chats" },
          { icon: <Settings size={22} />, label: "Settings", to: "/dashboard/settings" }
        ];
    }
  };

  const navItems = getNavigationItems();
  const gridCols = `grid-cols-${navItems.length}`;

  // Don't show mobile navigation on auth pages
  if (location.pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm border-t border-border/20 z-40 md:hidden pb-safe">
      <div className="px-2 py-3">
        <div className={`${gridCols} gap-1 max-w-sm mx-auto grid`}>
          {navItems.map((item, index) => (
            <NavItem 
              key={index}
              icon={item.icon} 
              label={item.label} 
              to={item.to}
              isActive={isActive(item.to)}
            />
          ))}
        </div>
      </div>
      
      <div className="h-safe bg-white"></div>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  to, 
  isActive 
}: { 
  icon: React.ReactNode, 
  label: string, 
  to: string, 
  isActive: boolean 
}) {
  const handleClick = () => {
    console.log(`NavItem clicked: ${label} -> ${to}`);
  };

  return (
    <Link 
      to={to} 
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-center 
        py-2 px-3 rounded-xl transition-all duration-300 active:scale-95
        ${isActive 
          ? 'text-primary bg-primary/10 shadow-sm' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
        }
      `}
    >
      <div className={`
        p-1 rounded-lg transition-all duration-300
        ${isActive ? 'bg-primary/20' : ''}
      `}>
        {icon}
      </div>
      <span className={`
        text-xs mt-1 font-medium transition-all duration-300
        ${isActive ? 'text-primary' : ''}
      `}>
        {label}
      </span>
      
      {isActive && (
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
      )}
    </Link>
  );
}

