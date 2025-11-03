
import { useAuth as useAuthOriginal } from "@/providers/AuthProvider";
import { useCallback } from "react";

export const useAuth = () => {
  const auth = useAuthOriginal();

  // Use memoized logging to prevent excessive console output
  const loggedAuth = useCallback(() => {
    return auth;
  }, [auth]);

  return loggedAuth();
};
