
import { Building, User, HardHat } from "lucide-react";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function RoleToggle() {
  const { role, setRole } = useRole();
  
  useEffect(() => {
    // Log role changes for debugging
    console.log("Current role:", role);
  }, [role]);

  const handleToggle = (value: string) => {
    if (value) {
      setRole(value as UserRole);
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-4 border-b border-sidebar-border">
      <div className="flex justify-center">
        <ToggleGroup type="single" value={role} onValueChange={handleToggle} className="flex w-full">
          <ToggleGroupItem value="seeker" className="flex-1 gap-1">
            <User size={16} />
            <span className="hidden sm:inline">Seeker</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="landlord" className="flex-1 gap-1">
            <Building size={16} />
            <span className="hidden sm:inline">Landlord</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="developer" className="flex-1 gap-1">
            <HardHat size={16} />
            <span className="hidden sm:inline">Developer</span>
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
