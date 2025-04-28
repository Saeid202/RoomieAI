
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
      case 'developer':
        return '/dashboard/developer';
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden py-2">
      <div className="grid grid-cols-5 gap-1">
        <NavItem 
          icon={<Home size={20} />} 
          label="Home" 
          to={getHomeRoute()}
          isActive={isActive(getHomeRoute())}
        />
        
        <NavItem 
          icon={<MessageSquare size={20} />} 
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
          icon={<Building size={20} />} 
          label={role === 'seeker' ? "Buy & Co-own" : "Properties"} 
          to={getBuyCoOwnRoute()}
          isActive={isActive(getBuyCoOwnRoute())}
        />
        
        <NavItem 
          icon={<Search size={20} />} 
          label={role === 'seeker' ? "Rent & Roommate" : "Listings"} 
          to={getRentRoommateRoute()}
          isActive={isActive(getRentRoommateRoute())}
        />
      </div>
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
      className={`flex flex-col items-center justify-center py-1 ${
        isActive ? 'text-roomie-purple' : 'text-gray-500'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
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
        <Button 
          className="flex flex-col items-center justify-center bg-roomie-purple text-white rounded-full w-12 h-12 mx-auto -mt-5"
          size="icon"
        >
          <PlusCircle size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4 py-2">
          <h3 className="font-semibold text-lg">Create a Listing</h3>
          <div className="grid gap-3">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => setIsOpen(false)}
              asChild
            >
              <Link to={getListingPath()}>
                <Building className="mr-2 h-4 w-4" />
                {getListingLabel()}
              </Link>
            </Button>
            
            {role === 'seeker' && (
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link to="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
