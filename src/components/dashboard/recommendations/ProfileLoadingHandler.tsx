
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";

interface ProfileLoadingHandlerProps {
  loadProfileData: () => Promise<void>;
  onError?: (error: Error) => void;
  children: React.ReactNode;
}

export function ProfileLoadingHandler({ 
  loadProfileData, 
  onError,
  children 
}: ProfileLoadingHandlerProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadProfileData();
      } catch (error) {
        console.error("Error loading profile data:", error);
        if (onError) {
          onError(error instanceof Error ? error : new Error("Failed to load profile data"));
        }
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (user) {
      fetchData();
    } else {
      console.log("User not authenticated:", user);
    }
  }, [user, toast, loadProfileData, onError]);

  return <>{children}</>;
}
