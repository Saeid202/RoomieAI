
import { Building, User, HardHat } from "lucide-react";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export function RoleToggle() {
  const { role, setRole } = useRole();
  const { user } = useAuth();
  
  // Get the user's assigned role from metadata
  const assignedRole = user?.user_metadata?.role as UserRole | undefined;
  
  useEffect(() => {
    // Log role changes for debugging
    console.log("Current role:", role);
    console.log("Assigned role from metadata:", assignedRole);
    
    // Ensure the user's role matches their assigned role if they have one
    if (assignedRole && role !== assignedRole) {
      setRole(assignedRole);
    }
  }, [role, assignedRole, setRole]);

  // If the user has an assigned role, don't show any toggle UI
  if (assignedRole) {
    return (
      <div className="flex flex-col space-y-2 p-4 border-b border-sidebar-border">
        <div className="text-center">
          <p className="font-semibold text-roomie-purple">
            {assignedRole === 'seeker' ? 'Roommate Finder' : 
             assignedRole === 'landlord' ? 'Landlord Portal' : 
             'Developer Portal'}
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          {assignedRole === 'seeker' 
            ? "Find your ideal rental or co-ownership opportunity" 
            : assignedRole === 'landlord'
              ? "List and manage rental properties and tenants"
              : "List and manage properties for sale only"}
        </p>
      </div>
    );
  }

  // Only show the toggle group for users without an assigned role
  const handleToggle = (value: string) => {
    if (value) {
      setRole(value as UserRole);
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-4 border-b border-sidebar-border">
      <div className="flex justify-center">
        <ToggleGroup 
          type="single" 
          value={role} 
          onValueChange={handleToggle} 
          className="grid grid-cols-3 w-full gap-2"
        >
          <ToggleGroupItem 
            value="seeker" 
            className="flex items-center justify-center gap-1 w-full"
          >
            <User size={16} />
            <span className="text-xs sm:text-sm">Seeker</span>
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="landlord" 
            className="flex items-center justify-center gap-1 w-full"
          >
            <Building size={16} />
            <span className="text-xs sm:text-sm">Landlord</span>
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="developer" 
            className="flex items-center justify-center gap-1 w-full"
          >
            <HardHat size={16} />
            <span className="text-xs sm:text-sm">Developer</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        {role === 'seeker' 
          ? "Find your ideal rental or co-ownership opportunity" 
          : role === 'landlord'
            ? "List and manage rental properties and tenants"
            : "List and manage properties for sale only"}
      </p>
    </div>
  );
}
