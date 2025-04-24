
import { useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
        const { data } = await supabase.auth.getUser();
        console.log("RoleInitializer - full user data:", data);
        
        const userRole = data.user?.user_metadata?.role;
        console.log("RoleInitializer - checking role from metadata:", userRole);
        
        if (userRole && role !== userRole) {
          console.log("Setting role to match user metadata:", userRole);
          setRole(userRole);
        } else if (!userRole) {
          console.warn("No role found in user metadata in RoleInitializer");
        }
      }
    };
    
    checkUserRole();
  }, [user, setRole, role]);

  return <>{children}</>;
}
