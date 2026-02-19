import { useState, useEffect, useRef } from "react";
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

interface RoleSwitcherProps {
  variant?: 'default' | 'full-width';
}

export function RoleSwitcher({ variant = 'default' }: RoleSwitcherProps) {
  const { role, setRole } = useRole();
  const { updateMetadata, user } = useAuth();
  const navigate = useNavigate();
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['seeker', 'landlord', 'renovator']);
  const isNavigatingRef = useRef(false);

  // Load available roles on mount
  useEffect(() => {
    async function loadAvailableRoles() {
      if (!user) return;

      try {
        const roles = await getAvailableRoles(user.id) as UserRole[];
        setAvailableRoles(roles);
        
        // If current role is not in available roles, reset to seeker
        if (role && !roles.includes(role as UserRole)) {
          console.log(`Current role '${role}' is not available, resetting to seeker`);
          setRole('seeker');
          await updateMetadata({ role: 'seeker' });
        }
      } catch (error) {
        console.error('Error loading available roles:', error);
      }
    }

    loadAvailableRoles();
  }, [user?.id]); // Only depend on user ID

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === role || isNavigatingRef.current) return;

    isNavigatingRef.current = true;
    setIsRoleSwitching(true);
    try {
      await updateMetadata({ role: newRole });
      setRole(newRole);

      // Navigate to appropriate dashboard
      switch (newRole) {
        case 'seeker':
          navigate('/dashboard/roommate-recommendations', { replace: true });
          break;
        case 'landlord':
          navigate('/dashboard/landlord', { replace: true });
          break;
        case 'admin':
          navigate('/dashboard/admin', { replace: true });
          break;
        case 'renovator':
          navigate('/renovator/dashboard', { replace: true });
          break;
        case 'developer':
          navigate('/dashboard/landlord', { replace: true }); // Developers can access landlord features
          break;
      }

      toast({
        title: "Role updated",
        description: `You are now using Roomie AI as a ${getRoleDisplay(newRole)}`,
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
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000);
    }
  };

  const getRoleDisplay = (roleValue: UserRole | string) => {
    switch (roleValue) {
      case 'seeker': return 'Seeker';
      case 'landlord': return 'Landlord';
      case 'admin': return 'Administrator';
      case 'renovator': return 'Renovator';
      case 'developer': return 'Developer';
      default: return 'User';
    }
  };

  const getRoleIcon = (roleValue: UserRole | string) => {
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
          className={`flex items-center gap-2 font-semibold ${variant === 'full-width' ? 'w-full justify-between' : ''}`}
          disabled={isRoleSwitching}
        >
          <div className="flex items-center gap-2">
            {getRoleIcon(role)}
            {getRoleDisplay(role)}
          </div>
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
