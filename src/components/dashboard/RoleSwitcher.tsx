import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, User, Shield, ChevronDown } from "lucide-react";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const { updateMetadata } = useAuth();
  const navigate = useNavigate();
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === role) return;
    
    setIsRoleSwitching(true);
    try {
      await updateMetadata({ role: newRole });
      setRole(newRole);
      
      // Navigate to appropriate dashboard
      switch (newRole) {
        case 'seeker':
          navigate('/dashboard/roommate-recommendations');
          break;
        case 'landlord':
          navigate('/dashboard/landlord');
          break;
        case 'admin':
          navigate('/dashboard/admin');
          break;
      }
      
      toast({
        title: "Role updated",
        description: `You are now using RoomieMatch as a ${getRoleDisplay(newRole)}`,
      });
    } catch (error) {
      console.error("Error changing role:", error);
      toast({
        title: "Error changing role",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsRoleSwitching(false);
    }
  };

  const getRoleDisplay = (roleValue: UserRole) => {
    switch (roleValue) {
      case 'seeker': return 'Seeker';
      case 'landlord': return 'Landlord';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const getRoleIcon = (roleValue: UserRole) => {
    switch (roleValue) {
      case 'seeker': return <User className="h-4 w-4" />;
      case 'landlord': return <Building className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  // Get available roles (exclude current role)
  const availableRoles: UserRole[] = ['seeker', 'landlord', 'admin'].filter(r => r !== role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 font-semibold"
          disabled={isRoleSwitching}
        >
          {getRoleIcon(role)}
          {getRoleDisplay(role)}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        {availableRoles.map((availableRole) => (
          <DropdownMenuItem 
            key={availableRole}
            onClick={() => handleRoleChange(availableRole)}
            className="cursor-pointer"
          >
            {getRoleIcon(availableRole)}
            <span className="ml-2">{getRoleDisplay(availableRole)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
