
// Import from providers/AuthProvider instead of contexts/AuthContext
import { useAuth as useAuthOriginal } from "@/providers/AuthProvider";

export const useAuth = useAuthOriginal;
