
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
      toast({
        title: "Role Fixed",
        description: `Your role has been set to ${assignedRole}`,
      });
    }
  }, [role, assignedRole, setRole]);

  // Always show only the assigned role info without any toggle UI
  return (
    <div className="flex flex-col space-y-2 p-4 border-b border-sidebar-border">
      <div className="text-center">
        <p className="font-semibold text-roomie-purple">
          {role === 'seeker' ? 'Roommate Finder' : 
           role === 'landlord' ? 'Landlord Portal' : 
           'Developer Portal'}
        </p>
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
