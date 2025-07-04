
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Settings, ChevronDown, User, Home, Building, HardHat, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, useRole } from "@/contexts/RoleContext";
import { toast } from "@/hooks/use-toast";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";

export function UserMenu() {
  const { user, signOut, updateMetadata } = useAuth();
  const { role, setRole } = useRole();
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === role) return;
    
    setIsRoleSwitching(true);
    try {
      await updateMetadata({ role: newRole });
      
      setRole(newRole);
      
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

  const getRoleIcon = (roleValue: UserRole) => {
    switch (roleValue) {
      case 'seeker':
        return <User className="h-4 w-4 text-roomie-purple" />;
      case 'landlord':
        return <Building className="h-4 w-4 text-roomie-purple" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-roomie-purple" />;
      default:
        return <User className="h-4 w-4 text-roomie-purple" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="block md:hidden">
        <h2 className="text-xl font-bold text-roomie-purple">RoomieMatch</h2>
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-roomie-purple text-white flex items-center justify-center">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium">
                {getRoleDisplay(role as UserRole)}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Account</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="font-normal pt-0">
              <div className="flex flex-col space-y-1">
                <p className="text-sm text-muted-foreground">Current Role</p>
                <div className="flex items-center gap-2">
                  {getRoleIcon(role as UserRole)}
                  <span className="font-medium">{getRoleDisplay(role as UserRole)}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem 
              onClick={() => setShowRoleDialog(true)}
              className="cursor-pointer"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Switch Role</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/dashboard" className="w-full flex items-center">
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings" className="w-full flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <RoleSelectionDialog 
          isOpen={showRoleDialog} 
          onClose={() => setShowRoleDialog(false)}
          onRoleSelect={handleRoleChange}
          currentRole={role as UserRole}
        />
      </div>
    </div>
  );
}
