
import { useEffect, useState, useCallback } from "react";
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

  useEffect(() => {
    console.log("ProfileLoadingHandler - Component mounted");
    setComponentMounted(true);
    
    return () => {
      console.log("ProfileLoadingHandler - Component unmounted");
    };
  }, []);

  const handleLoadError = useCallback((error: Error) => {
    console.error("Error loading profile data:", error);
    setLoadError(error);
    setHasAttemptedLoad(true);
    setIsLoading(false);
    
    if (onError) {
      onError(error);
    }
    
    toast({
      title: "Error",
      description: "Failed to load profile data. Please try again.",
      variant: "destructive",
    });
  }, [onError, toast]);

  const attemptLoadProfile = useCallback(async () => {
    if (!componentMounted) {
      console.log("ProfileLoadingHandler - Component not mounted yet, skipping load");
      return;
    }
    
    try {
      setIsLoading(true);
      setLoadError(null);
      
      console.log("ProfileLoadingHandler - Attempting to load profile data");
      await loadProfileData();
      
      console.log("ProfileLoadingHandler - Profile loaded successfully");
      setHasAttemptedLoad(true);
      setIsLoading(false);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("Failed to load profile data");
      handleLoadError(errorObj);
    }
  }, [componentMounted, loadProfileData, handleLoadError]);

  useEffect(() => {
    if (!componentMounted) return;
    
    console.log("ProfileLoadingHandler - Initialize loading, user:", user?.email);
    
    const timeoutId = setTimeout(() => {
      if (user) {
        console.log("User authenticated, fetching profile");
        attemptLoadProfile();
      } else {
        console.log("User not authenticated, skipping profile load");
        setHasAttemptedLoad(true);
        setIsLoading(false);
      }
    }, 200);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, componentMounted, attemptLoadProfile]);

  if (isLoading && !hasAttemptedLoad) {
    console.log("ProfileLoadingHandler - Showing loading state");
    return <LoadingState />;
  }

  console.log("ProfileLoadingHandler - Rendering children");
  return <>{children}</>;
}
