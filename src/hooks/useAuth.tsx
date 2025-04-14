
// Direct re-export of the auth hook from the provider
import { useAuth as useAuthOriginal } from "@/contexts/AuthContext";

export const useAuth = useAuthOriginal;
