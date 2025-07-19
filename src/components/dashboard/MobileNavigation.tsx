
import { Home, Search, PlusCircle, Building, User, MessageSquare, Users, Settings, Calendar, Clock, List, MapPin, Group, Briefcase, Flag, Scale } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export function MobileNavigation() {
  const location = useLocation();
  const { role } = useRole();
  const { user } = useAuth();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Get navigation items based on role and authentication status
  const getNavigationItems = () => {
    // If user is not authenticated, show public navigation
    if (!user) {
      return [
        { icon: <Home size={22} />, label: "Home", to: "/" },
        { icon: <Building size={22} />, label: "Rentals", to: "/rental-options" },
        { icon: <MessageSquare size={22} />, label: "About", to: "/" },
        { icon: <User size={22} />, label: "Login", to: "/auth" }
      ];
    }

    // Authenticated user navigation based on role
    switch (role) {
      case 'landlord':
        return [
          { icon: <Home size={22} />, label: "Dashboard", to: "/dashboard/landlord" },
          { icon: <Building size={22} />, label: "Properties", to: "/dashboard/landlord/properties" },
          { icon: <Users size={22} />, label: "Applications", to: "/dashboard/landlord/applications" },
          { icon: <MessageSquare size={22} />, label: "Messages", to: "/dashboard/chats" },
          { icon: <Settings size={22} />, label: "Settings", to: "/dashboard/settings" }
        ];
      
      case 'admin':
        return [
          { icon: <Home size={22} />, label: "Dashboard", to: "/dashboard/admin" },
          { icon: <Users size={22} />, label: "Users", to: "/dashboard/admin/users" },
          { icon: <Building size={22} />, label: "Pages", to: "/dashboard/admin/pages" },
          { icon: <MessageSquare size={22} />, label: "Messages", to: "/dashboard/chats" },
          { icon: <Settings size={22} />, label: "Settings", to: "/dashboard/admin/settings" }
        ];
      
      default: // seeker
        return [
          { icon: <Home size={22} />, label: "Dashboard", to: "/dashboard" },
          { icon: <Users size={22} />, label: "Matches", to: "/dashboard/matches" },
          { icon: <Building size={22} />, label: "Rentals", to: "/dashboard/rental-options" },
          { icon: <MessageSquare size={22} />, label: "Legal AI", to: "/dashboard/chats" },
          { icon: <Settings size={22} />, label: "Settings", to: "/dashboard/settings" }
        ];
    }
  };

  const navItems = getNavigationItems();
  const firstTwoItems = navItems.slice(0, 2);
  const lastTwoItems = navItems.slice(2, 4);

  // Don't show mobile navigation on auth pages
  if (location.pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm border-t border-border/20 z-40 md:hidden pb-safe">
      <div className="px-2 py-3">
        <div className="grid grid-cols-5 gap-1 max-w-sm mx-auto">
          {firstTwoItems.map((item, index) => (
            <NavItem 
              key={index}
              icon={item.icon} 
              label={item.label} 
              to={item.to}
              isActive={isActive(item.to)}
            />
          ))}
          
          {/* Add button in the center - only show for authenticated users */}
          {user ? (
            <AddButton 
              isOpen={isAddMenuOpen}
              setIsOpen={setIsAddMenuOpen}
              role={role as string}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <Search size={20} className="text-muted-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground mt-1">Search</span>
            </div>
          )}
          
          {lastTwoItems.map((item, index) => (
            <NavItem 
              key={index + 2}
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

function AddButton({ 
  isOpen, 
  setIsOpen, 
  role 
}: { 
  isOpen: boolean, 
  setIsOpen: (state: boolean) => void, 
  role: string 
}) {
  const getListingPath = () => {
    switch (role) {
      case 'landlord':
        return '/dashboard/landlord/add-property';
      case 'developer':
        return '/dashboard/developer/add-property';
      default:
        return '/dashboard/list-room';
    }
  };

  const getListingLabel = () => {
    switch (role) {
      case 'landlord':
        return 'List a Rental Property';
      case 'developer':
        return 'List Property for Sale';
      default:
        return 'List a Room';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative flex flex-col items-center justify-center">
          <Button 
            className="
              relative flex items-center justify-center 
              bg-gradient-to-br from-primary via-primary to-primary/80 
              text-primary-foreground shadow-lg shadow-primary/30
              rounded-2xl w-14 h-14 -mt-6 border-4 border-background
              hover:shadow-xl hover:shadow-primary/40 hover:scale-105
              active:scale-95 transition-all duration-300
            "
            size="icon"
          >
            <PlusCircle size={26} className="drop-shadow-sm" />
            
            <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
          </Button>
          <span className="text-xs font-medium text-foreground mt-2">Add</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <div className="space-y-6 py-2">
          <div className="text-center">
            <h3 className="font-bold text-xl text-foreground">Create a Listing</h3>
          </div>
          <div className="grid gap-3">
            <Button 
              variant="outline" 
              className="justify-start h-12 rounded-xl border-2 hover:border-primary hover:bg-primary/5"
              onClick={() => setIsOpen(false)}
              asChild
            >
              <Link to={getListingPath()}>
                <Building className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">{getListingLabel()}</div>
                </div>
              </Link>
            </Button>
            
            {role === 'seeker' && (
              <Button 
                variant="outline" 
                className="justify-start h-12 rounded-xl border-2 hover:border-primary hover:bg-primary/5"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link to="/dashboard/profile">
                  <User className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Update Profile</div>
                  </div>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
