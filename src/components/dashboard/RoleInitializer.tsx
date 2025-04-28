
import { useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface RoleInitializerProps {
  children: React.ReactNode;
}

export function RoleInitializer({ children }: RoleInitializerProps) {
  const { role, setRole } = useRole();
  const { user } = useAuth();
  
  useEffect(() => {
    console.log("RoleInitializer - current role:", role);
    console.log("RoleInitializer - user:", user?.email);
    console.log("RoleInitializer - user metadata:", user?.user_metadata);
    
    const checkUserRole = async () => {
      if (user) {
        const userRole = user.user_metadata?.role;
        console.log("RoleInitializer - checking role from metadata:", userRole);
        
        if (userRole && role !== userRole) {
          console.log("Setting role to match user metadata:", userRole);
          setRole(userRole);
          
          // Show a toast notification when role is set/changed
          toast({
            title: "Role initialized",
            description: `You are using Roomi AI as a ${getRoleDisplay(userRole)}`,
            duration: 3000,
          });
        } else if (!userRole) {
          console.warn("No role found in user metadata in RoleInitializer");
        }
      }
    };
    
    checkUserRole();
  }, [user, setRole, role]);

  // Helper function to get a display-friendly role name
  const getRoleDisplay = (roleValue: string): string => {
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

  return <>{children}</>;
}
