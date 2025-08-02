
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Building, HardHat, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface RoleSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect?: (role: UserRole) => void;
  currentRole?: UserRole;
  showCloseButton?: boolean;
}

export function RoleSelectionDialog({ 
  isOpen, 
  onClose, 
  onRoleSelect,
  currentRole,
  showCloseButton = false 
}: RoleSelectionDialogProps) {
  const { updateMetadata, user } = useAuth();
  const { refreshRole } = useRole();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  
  // Reset selected role when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(currentRole || null);
    }
  }, [isOpen, currentRole]);

  const handleRoleSelect = async (role: UserRole) => {
    if (loading) return;
    
    setLoading(true);
    setSelectedRole(role);
    
    try {
      if (onRoleSelect) {
        await onRoleSelect(role);
      } else {
        await updateMetadata({ role });
        await refreshRole();
        
        toast({
          title: "Role selected",
          description: `You are now using Roomi AI as a ${getRoleLabel(role)}`,
        });
        
        // Redirect to appropriate dashboard
        redirectToRoleDashboard(role);
      }
    } catch (error) {
      console.error("Error selecting role:", error);
      toast({
        title: "Error selecting role",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const redirectToRoleDashboard = (role: UserRole) => {
    switch (role) {
      case 'landlord':
        navigate('/dashboard/landlord');
        break;
      case 'admin':
        navigate('/dashboard/admin');
        break;
      case 'seeker':
        navigate('/dashboard/roommate-recommendations');
        break;
    }
  };
  
  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
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

  const getRoleDescription = (role: UserRole): string => {
    switch (role) {
      case 'seeker':
        return 'Looking for a roommate or rental property.';
      case 'landlord':
        return 'List and manage rental properties, communicate with potential tenants.';
      case 'admin':
        return 'Manage the website content, user accounts, and system settings.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {currentRole ? "Switch Your Role" : "Welcome to Roomi AI"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center text-muted-foreground mb-6">
            {currentRole 
              ? "Select the role you want to switch to:"
              : `Hello${user?.email ? ', ' + (user.email.split('@')[0] || '') : ''}! Please select how you'll be using Roomi AI:`}
          </p>
          
          <div className="grid gap-4">
            <RoleCard
              role="seeker"
              icon={<User size={24} />}
              title="Seeker"
              description={getRoleDescription('seeker')}
              isSelected={selectedRole === 'seeker'}
              onClick={() => handleRoleSelect('seeker')}
              isLoading={loading && selectedRole === 'seeker'}
              isCurrent={currentRole === 'seeker'}
            />
            
            <RoleCard
              role="landlord"
              icon={<Building size={24} />}
              title="Landlord"
              description={getRoleDescription('landlord')}
              isSelected={selectedRole === 'landlord'}
              onClick={() => handleRoleSelect('landlord')}
              isLoading={loading && selectedRole === 'landlord'}
              isCurrent={currentRole === 'landlord'}
            />
            
            <RoleCard
              role="admin"
              icon={<Shield size={24} />}
              title="Administrator"
              description={getRoleDescription('admin')}
              isSelected={selectedRole === 'admin'}
              onClick={() => handleRoleSelect('admin')}
              isLoading={loading && selectedRole === 'admin'}
              isCurrent={currentRole === 'admin'}
            />
          </div>
        </div>
        
        {showCloseButton && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface RoleCardProps {
  role: UserRole;
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  isLoading: boolean;
  isCurrent: boolean;
}

function RoleCard({ 
  role, icon, title, description, isSelected, onClick, isLoading, isCurrent 
}: RoleCardProps) {
  return (
    <button
      type="button"
      className={`p-4 rounded-lg border transition-all flex items-start gap-3 hover:border-roomie-purple ${
        isSelected 
          ? 'border-roomie-purple bg-roomie-purple/5' 
          : isCurrent
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-200'
      }`}
      onClick={onClick}
      disabled={isLoading || isCurrent}
    >
      <div className={`mt-1 text-roomie-purple ${isCurrent ? 'opacity-50' : ''}`}>
        {icon}
      </div>
      <div className="text-left">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium ${isCurrent ? 'text-gray-500' : ''}`}>
            {title}
          </h3>
          {isCurrent && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
              Current
            </span>
          )}
        </div>
        <p className={`text-sm text-muted-foreground mt-1 ${isCurrent ? 'opacity-70' : ''}`}>
          {description}
        </p>
      </div>
    </button>
  );
}
