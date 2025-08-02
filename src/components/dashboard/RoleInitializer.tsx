
import { useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface RoleInitializerProps {
  children: React.ReactNode;
}

export function RoleInitializer({ children }: RoleInitializerProps) {
  const { role, loading, refreshRole } = useRole();
  const { user } = useAuth();
  
  useEffect(() => {
    const initializeRole = async () => {
      if (!user || loading) return;
      
      console.log("RoleInitializer - user:", user?.email);
      console.log("RoleInitializer - current role:", role);
      
      // Refresh role from server-side database
      await refreshRole();
      
      if (role) {
        toast({
          title: "Role initialized",
          description: `You are using Roomi AI as a ${getRoleDisplay(role)}`,
          duration: 3000,
        });
      } else {
        console.warn("No role found for user in database");
      }
    };
    
    initializeRole();
  }, [user, refreshRole]); // Removed role and loading from dependencies to avoid loops

  // Helper function to get a display-friendly role name
  const getRoleDisplay = (roleValue: string): string => {
    switch (roleValue) {
      case 'seeker':
        return 'Seeker';
      case 'landlord':
        return 'Landlord';
      case 'developer':
        return 'Builder/Realtor';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  return <>{children}</>;
}
