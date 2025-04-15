
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
    console.log("Dashboard mounted - current role:", role);
    console.log("Dashboard mounted - user:", user?.email);
    console.log("Dashboard mounted - user metadata:", user?.user_metadata);
    
    const checkUserRole = async () => {
      if (user) {
        const { data } = await supabase.auth.getUser();
        console.log("Dashboard effect - full user data:", data);
        
        const userRole = data.user?.user_metadata?.role;
        console.log("Dashboard effect - checking role from metadata:", userRole);
        
        if (userRole && role !== userRole) {
          console.log("Setting role to match user metadata:", userRole);
          setRole(userRole);
        } else if (!userRole) {
          console.warn("No role found in user metadata in Dashboard effect");
        }
      }
    };
    
    checkUserRole();
  }, [user, setRole, role]);

  return <>{children}</>;
}
