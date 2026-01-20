
import { Building, User, HardHat, Shield, ChevronDown } from "lucide-react";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";

export function RoleToggle() {
  const { role, setRole } = useRole();
  const { user, updateMetadata } = useAuth();
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  // Get the user's assigned role from metadata
  const assignedRole = user?.user_metadata?.role as UserRole | undefined;

  useEffect(() => {
    // Ensure the user's role matches their assigned role if they have one
    if (assignedRole && role !== assignedRole) {
      setRole(assignedRole);
    }
  }, [role, assignedRole, setRole]);

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === role) return;

    setIsRoleSwitching(true);
    try {
      await updateMetadata({ role: newRole });

      setRole(newRole);

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
    }
  };

  // Display appropriate role name and description based on user's assigned role
  const getRoleDisplay = (roleValue?: UserRole) => {
    switch (roleValue || role) {
      case 'seeker':
        return 'Seeker';
      case 'landlord':
        return 'Landlord';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  const getRoleInfo = () => {
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
      case 'admin':
        return {
          title: 'Admin Portal',
          description: 'Manage site content, users, and settings',
          icon: <Shield className="h-5 w-5 text-roomie-purple" />
        };
      default:
        return {
          title: 'User Portal',
          description: 'Welcome to your dashboard',
          icon: <User className="h-5 w-5 text-roomie-purple" />
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="flex flex-col space-y-2 p-4 border-b border-sidebar-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center justify-between w-full p-2 hover:bg-sidebar-accent"
            disabled={isRoleSwitching}
          >
            <div className="flex items-center space-x-2">
              {roleInfo.icon}
              <p className="font-semibold text-roomie-purple">{roleInfo.title}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuItem
            onClick={() => setShowRoleDialog(true)}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Switch Role</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <p className="text-xs text-muted-foreground text-center">
        {roleInfo.description}
      </p>

      <RoleSelectionDialog
        isOpen={showRoleDialog}
        onClose={() => setShowRoleDialog(false)}
        onRoleSelect={handleRoleChange}
        currentRole={role as UserRole}
      />
    </div>
  );
}
