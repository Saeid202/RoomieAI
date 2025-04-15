
import { useAuth as useAuthOriginal } from "@/providers/AuthProvider";
import { useCallback } from "react";

export const useAuth = () => {
  const auth = useAuthOriginal();
  
  // Use memoized logging to prevent excessive console output
  const loggedAuth = useCallback(() => {
    // Only log in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log("useAuth hook called, auth state:", { 
        user: auth.user?.email || null, 
        authenticated: !!auth.user, 
        loading: auth.loading,
        hasSession: !!auth.session
      });
    }
    
    return auth;
  }, [auth]);
  
  return loggedAuth();
};
