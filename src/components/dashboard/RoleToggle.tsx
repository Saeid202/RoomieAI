
import { Building, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

export function RoleToggle() {
  const { role, setRole } = useRole();
  
  const handleToggle = (checked: boolean) => {
    setRole(checked ? 'landlord' : 'seeker');
  };

  useEffect(() => {
    // Log role changes for debugging
    console.log("Current role:", role);
  }, [role]);

  return (
    <div className="flex flex-col space-y-2 p-4 border-b border-sidebar-border">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User size={18} className={role === 'seeker' ? 'text-roomie-purple' : 'text-gray-400'} />
          <Label htmlFor="role-toggle" className="text-sm font-medium">Seeker</Label>
        </div>
        
        <Switch 
          id="role-toggle"
          checked={role === 'landlord'}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-roomie-purple"
        />
        
        <div className="flex items-center gap-2">
          <Label htmlFor="role-toggle" className="text-sm font-medium">Landlord</Label>
          <Building size={18} className={role === 'landlord' ? 'text-roomie-purple' : 'text-gray-400'} />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {role === 'seeker' 
          ? "Find your ideal rental or co-ownership opportunity" 
          : "List and manage your properties"}
      </p>
    </div>
  );
}
