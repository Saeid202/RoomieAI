
// Import from providers/AuthProvider instead of contexts/AuthContext
import { useAuth as useAuthOriginal } from "@/providers/AuthProvider";

export const useAuth = () => {
  const auth = useAuthOriginal();
  console.log("useAuth hook called, auth state:", { 
    user: auth.user?.email || null, 
    authenticated: !!auth.user, 
    loading: auth.loading 
  });
  return auth;
};
