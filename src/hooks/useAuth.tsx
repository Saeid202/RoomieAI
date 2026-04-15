
import { useAuth as useAuthOriginal } from "@/providers/AuthProvider";
import { useMemo } from "react";

// Module-level variable for throttling logs
let lastLogTime = 0;

export const useAuth = () => {
  const auth = useAuthOriginal();
  
  // Simplified auth hook to prevent performance issues
  const loggedAuth = useMemo(() => {
    // Only log in development environment and reduce frequency
    if (process.env.NODE_ENV === 'development') {
      const now = Date.now();
      if (!lastLogTime || now - lastLogTime > 5000) { // Reduced frequency to 5 seconds
        console.log("useAuth hook called, auth state:", { 
          user: auth.user?.email || null, 
          authenticated: !!auth.user, 
          loading: auth.loading,
          hasSession: !!auth.session
        });
        lastLogTime = now;
      }
    }
    
    return auth;
  }, [auth]);
  
  return loggedAuth;
};
