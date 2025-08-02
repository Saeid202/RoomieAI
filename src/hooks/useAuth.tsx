
import { useAuth as useAuthOriginal } from "@/providers/AuthProvider";
import { useCallback } from "react";

export const useAuth = () => {
  const auth = useAuthOriginal();
  console.log("useAuth called - user:", auth.user?.email, "loading:", auth.loading);
  return auth;
};
