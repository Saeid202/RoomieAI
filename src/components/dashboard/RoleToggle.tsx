
import { Building, User, HardHat } from "lucide-react";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { Label } from "@/components/ui/label";
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
  }, [role, assignedRole]);

  const handleToggle = (value: string) => {
    // If user has an assigned role, only allow switching to that role
    if (assignedRole && value !== assignedRole) {
      toast({
        title: "Permission denied",
        description: `You are registered as a ${assignedRole} and cannot switch to ${value} role.`,
        variant: "destructive",
      });
      return;
    }
    
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
            disabled={assignedRole && assignedRole !== "seeker"}
          >
            <User size={16} />
            <span className="text-xs sm:text-sm">Seeker</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="landlord" 
            className="flex items-center justify-center gap-1 w-full"
            disabled={assignedRole && assignedRole !== "landlord"}
          >
            <Building size={16} />
            <span className="text-xs sm:text-sm">Landlord</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="developer" 
            className="flex items-center justify-center gap-1 w-full"
            disabled={assignedRole && assignedRole !== "developer"}
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
