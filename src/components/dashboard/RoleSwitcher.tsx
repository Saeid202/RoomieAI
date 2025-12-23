import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building, User, Shield, ChevronDown, Hammer } from "lucide-react";
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
import { getAvailableRoles } from "@/services/adminService";

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const { updateMetadata, user } = useAuth();
  const navigate = useNavigate();
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['seeker', 'landlord']);

  // Load available roles on mount
  useEffect(() => {
    async function loadAvailableRoles() {
      if (!user) return;

      try {
        const roles = await getAvailableRoles(user.id) as UserRole[];
        setAvailableRoles(roles);
      } catch (error) {
        console.error('Error loading available roles:', error);
      }
    }

    loadAvailableRoles();
  }, [user]);

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
        case 'renovator':
          navigate('/renovator/dashboard');
          break;
        case 'developer':
          navigate('/renovator/dashboard'); // For testing/developer access
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
      case 'renovator': return 'Renovator';
      case 'developer': return 'Developer';
      default: return 'User';
    }
  };

  const getRoleIcon = (roleValue: UserRole) => {
    switch (roleValue) {
      case 'seeker': return <User className="h-4 w-4" />;
      case 'landlord': return <Building className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'renovator': return <Hammer className="h-4 w-4" />;
      case 'developer': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  // Filter available roles to exclude current role
  const switchableRoles = availableRoles.filter(r => r !== role);

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
        {switchableRoles.map((availableRole) => (
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
