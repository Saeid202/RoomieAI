
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Settings, ChevronDown, Home, Menu, User, Building, Shield } from "lucide-react";
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
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "@/hooks/use-toast";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";

export function UserMenu() {
  const { user, signOut, updateMetadata } = useAuth();
  const { role, setRole } = useRole();
  const { toggleSidebar } = useSidebar();
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
        <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="font-semibold"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Role Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl border-2 hover:border-primary/30 px-3 font-semibold"
                  disabled={isRoleSwitching}
                >
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                    {getRoleIcon(role as UserRole)}
                  </div>
                  <span className="text-sm font-bold">
                    {getRoleDisplay(role as UserRole)}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem
                  onClick={() => setShowRoleDialog(true)}
                  className="cursor-pointer font-semibold"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Switch Role</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl border-2 hover:border-primary/30 md:px-4 px-2 font-semibold"
                >
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-bold">
                    Account
                  </span>
                  <ChevronDown className="h-4 w-4 md:block hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="start">
                <DropdownMenuLabel className="font-semibold">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">Account</p>
                    <p className="text-xs text-muted-foreground font-medium">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full flex items-center font-semibold">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="w-full flex items-center font-semibold">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={signOut} className="cursor-pointer font-semibold">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        
        <div className="block md:hidden">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            RoomieMatch
          </h2>
        </div>
      </div>

      <RoleSelectionDialog 
        isOpen={showRoleDialog} 
        onClose={() => setShowRoleDialog(false)}
        onRoleSelect={handleRoleChange}
        currentRole={role as UserRole}
      />
    </div>
  );
}
