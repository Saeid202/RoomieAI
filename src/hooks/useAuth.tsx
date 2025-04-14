
import { useAuth as useAuthOriginal } from "@/providers/AuthProvider";

export const useAuth = () => {
  const auth = useAuthOriginal();
  
  // Simple logging without complex objects that might cause issues
  console.log("useAuth hook called, auth state:", { 
    isAuthenticated: !!auth.user, 
    isLoading: auth.loading 
  });
  
  return auth;
};
