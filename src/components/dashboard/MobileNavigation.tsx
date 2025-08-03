
import { Home, Search, PlusCircle, Building, User, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export function MobileNavigation() {
  const location = useLocation();
  const { role } = useRole();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Determine role-specific routes
  const getHomeRoute = () => {
    switch (role) {
      case 'landlord':
        return '/dashboard/landlord';
      default:
        return '/dashboard/roommate-recommendations';
    }
  };

  const getRentRoommateRoute = () => {
    return role === 'seeker' ? '/dashboard/roommate-recommendations' : '/dashboard/landlord';
  };

  const getBuyCoOwnRoute = () => {
    return role === 'seeker' ? '/dashboard/co-owner-recommendations' : '/dashboard/developer';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm border-t border-border/20 z-40 md:hidden pb-safe">
      {/* Modern glass morphism navigation bar */}
      <div className="px-2 py-3">
        <div className="grid grid-cols-5 gap-1 max-w-sm mx-auto">
          <NavItem 
            icon={<Home size={22} />} 
            label="Home" 
            to={getHomeRoute()}
            isActive={isActive(getHomeRoute())}
          />
          
          <NavItem 
            icon={<MessageSquare size={22} />} 
            label="Legal AI" 
            to="/dashboard/legal-assistant"
            isActive={isActive('/dashboard/legal-assistant')}
          />
          
          <AddButton 
            isOpen={isAddMenuOpen}
            setIsOpen={setIsAddMenuOpen}
            role={role as string}
          />
          
          <NavItem 
            icon={<Building size={22} />} 
            label={role === 'seeker' ? "Buy & Co-own" : "Properties"} 
            to={getBuyCoOwnRoute()}
            isActive={isActive(getBuyCoOwnRoute())}
          />
          
          <NavItem 
            icon={<Search size={22} />} 
            label={role === 'seeker' ? "Rent & Roommate" : "Listings"} 
            to={getRentRoommateRoute()}
            isActive={isActive(getRentRoommateRoute())}
          />
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
  isActive 
}: { 
  icon: React.ReactNode, 
  label: string, 
  to: string, 
  isActive: boolean 
}) {
  return (
    <Link 
      to={to} 
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
      
      {/* Active indicator */}
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
            
            {/* Floating animation */}
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
