
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
    if (!user) return;
    
    const userRole = user.user_metadata?.role;
    
    // Only update role if it's different and userRole exists
    if (userRole && role !== userRole) {
      console.log("RoleInitializer - syncing role:", userRole);
      setRole(userRole);
    }
  }, [user?.id, user?.user_metadata?.role]); // Only depend on user ID and role from metadata

  return <>{children}</>;
}
