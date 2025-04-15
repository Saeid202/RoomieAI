
import { Building, User, HardHat } from "lucide-react";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export function RoleToggle() {
  const { role, setRole } = useRole();
  const { user } = useAuth();
  
  // Get the user's assigned role from metadata
  const assignedRole = user?.user_metadata?.role as UserRole | undefined;
  
  useEffect(() => {
    // Ensure the user's role matches their assigned role if they have one
    if (assignedRole && role !== assignedRole) {
      setRole(assignedRole);
    }
  }, [role, assignedRole, setRole]);

  // Display appropriate role name and description based on user's assigned role
  const getRoleDisplay = () => {
    switch (role) {
      case 'seeker':
        return {
          title: 'Roommate Finder',
          description: 'Find your ideal rental or co-ownership opportunity',
          icon: <User className="h-5 w-5 text-roomie-purple" />
        };
      case 'landlord':
        return {
          title: 'Landlord Portal',
          description: 'List and manage rental properties and tenants',
          icon: <Building className="h-5 w-5 text-roomie-purple" />
        };
      case 'developer':
        return {
          title: 'Developer Portal',
          description: 'List and manage properties for sale only',
          icon: <HardHat className="h-5 w-5 text-roomie-purple" />
        };
      default:
        return {
          title: 'User Portal',
          description: 'Welcome to your dashboard',
          icon: <User className="h-5 w-5 text-roomie-purple" />
        };
    }
  };

  const roleDisplay = getRoleDisplay();

  return (
    <div className="flex flex-col space-y-2 p-4 border-b border-sidebar-border">
      <div className="flex items-center justify-center space-x-2">
        {roleDisplay.icon}
        <p className="font-semibold text-roomie-purple">{roleDisplay.title}</p>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        {roleDisplay.description}
      </p>
    </div>
  );
}
