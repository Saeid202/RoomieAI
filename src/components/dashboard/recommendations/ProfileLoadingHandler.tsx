
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "./LoadingState";

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
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    console.log("ProfileLoadingHandler - Initialize loading");
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await loadProfileData();
        
        if (isMounted) {
          console.log("ProfileLoadingHandler - Profile loaded successfully");
          setHasAttemptedLoad(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        
        if (isMounted) {
          setHasAttemptedLoad(true);
          setIsLoading(false);
          
          if (onError) {
            onError(error instanceof Error ? error : new Error("Failed to load profile data"));
          }
          
          toast({
            title: "Error",
            description: "Failed to load profile data. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    // Set a short timeout to ensure loading state is shown briefly
    // This prevents quick flashes of loading states
    const timeoutId = setTimeout(() => {
      if (user) {
        fetchData();
      } else {
        console.log("User not authenticated, skipping profile load");
        setHasAttemptedLoad(true);
        setIsLoading(false);
      }
    }, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user, toast, loadProfileData, onError]);

  if (isLoading && !hasAttemptedLoad) {
    return <LoadingState />;
  }

  return <>{children}</>;
}
