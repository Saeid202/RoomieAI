
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Settings, ChevronDown, User } from "lucide-react";
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
      case 'developer':
        return 'Builder/Realtor';
      default:
        return 'User';
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
            
            <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Switch Role</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings" className="w-full flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <RoleSelectionDialog 
          isOpen={showRoleDialog} 
          onClose={() => setShowRoleDialog(false)}
        />
      </div>
    </div>
  );
}
