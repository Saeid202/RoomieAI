
import { useAuth as useAuthOriginal } from "@/providers/AuthProvider";
import { useMemo } from "react";

// Module-level variable for throttling logs
let lastLogTime = 0;

export const useAuth = () => {
  const auth = useAuthOriginal();
  
  // Use memoized logging to prevent excessive console output
  const loggedAuth = useMemo(() => {
    // Only log in development environment and throttle logging
    if (process.env.NODE_ENV === 'development') {
      // Throttle logging to prevent console spam
      const now = Date.now();
      if (!lastLogTime || now - lastLogTime > 1000) {
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
