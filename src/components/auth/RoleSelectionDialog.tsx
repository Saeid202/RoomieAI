
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, User, HardHat } from "lucide-react";
import { UserRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RoleSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleSelectionDialog({ isOpen, onClose }: RoleSelectionDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = async (role: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user?.id);

      if (error) throw error;

      // Update metadata for consistency
      await supabase.auth.updateUser({
        data: { role }
      });

      toast({
        title: "Role selected",
        description: "Your dashboard will be customized based on your role.",
      });

      // Navigate to the appropriate dashboard based on role
      switch (role) {
        case 'landlord':
          navigate('/dashboard/landlord');
          break;
        case 'developer':
          navigate('/dashboard/developer');
          break;
        default:
          navigate('/dashboard/profile');
      }
      
      onClose();
    } catch (error) {
      console.error('Error selecting role:', error);
      toast({
        title: "Error",
        description: "Failed to set your role. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Hello {user?.email?.split('@')[0]}, please choose your role:
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 p-6"
            onClick={() => handleRoleSelect('seeker')}
          >
            <User className="h-5 w-5" />
            <div className="text-left">
              <p className="font-semibold">I'm a Seeker</p>
              <p className="text-sm text-muted-foreground">Looking for a roommate, rental, or to buy a property</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 p-6"
            onClick={() => handleRoleSelect('developer')}
          >
            <HardHat className="h-5 w-5" />
            <div className="text-left">
              <p className="font-semibold">I'm a Builder or Realtor</p>
              <p className="text-sm text-muted-foreground">Looking to list a property for sale</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 p-6"
            onClick={() => handleRoleSelect('landlord')}
          >
            <Building className="h-5 w-5" />
            <div className="text-left">
              <p className="font-semibold">I'm a Landlord</p>
              <p className="text-sm text-muted-foreground">Looking to manage and rent out properties</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
