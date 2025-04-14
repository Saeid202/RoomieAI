
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
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [componentMounted, setComponentMounted] = useState(false);

  // Mark component as mounted
  useEffect(() => {
    console.log("ProfileLoadingHandler - Component mounted");
    setComponentMounted(true);
    
    return () => {
      console.log("ProfileLoadingHandler - Component unmounted");
    };
  }, []);

  // Handle profile data loading
  useEffect(() => {
    console.log("ProfileLoadingHandler - Initialize loading, user:", user?.email);
    
    if (!componentMounted) {
      console.log("ProfileLoadingHandler - Component not mounted yet, skipping load");
      return;
    }
    
    let isMounted = true;
    
    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        setLoadError(null);
        
        console.log("ProfileLoadingHandler - Attempting to load profile data");
        await loadProfileData();
        
        if (isMounted) {
          console.log("ProfileLoadingHandler - Profile loaded successfully");
          setHasAttemptedLoad(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        
        if (isMounted) {
          const errorObj = error instanceof Error ? error : new Error("Failed to load profile data");
          setLoadError(errorObj);
          setHasAttemptedLoad(true);
          setIsLoading(false);
          
          if (onError) {
            onError(errorObj);
          }
          
          toast({
            title: "Error",
            description: "Failed to load profile data. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    // Use a shorter timeout but still show loading briefly for UX
    const timeoutId = setTimeout(() => {
      if (user) {
        console.log("User authenticated, fetching profile");
        fetchData();
      } else {
        console.log("User not authenticated, skipping profile load");
        setHasAttemptedLoad(true);
        setIsLoading(false);
      }
    }, 200);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      console.log("ProfileLoadingHandler unmounted");
    };
  }, [user, toast, loadProfileData, onError, componentMounted]);

  // Always show loading state initially
  if (isLoading && !hasAttemptedLoad) {
    console.log("ProfileLoadingHandler - Showing loading state");
    return <LoadingState />;
  }

  // Show children even if there was an error - error handling will be done in the children
  console.log("ProfileLoadingHandler - Rendering children");
  return <>{children}</>;
}
