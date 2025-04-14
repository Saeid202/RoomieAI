
import { ReactNode, useEffect, useState } from "react";
import { LoadingState } from "./LoadingState";

interface ProfileLoadingHandlerProps {
  children: ReactNode;
  loadProfileData: () => Promise<void>;
  onError?: (error: Error) => void;
  loadingTimeout?: number;
}

export function ProfileLoadingHandler({ 
  children, 
  loadProfileData, 
  onError,
  loadingTimeout = 1000 // Default timeout reduced for faster loading
}: ProfileLoadingHandlerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [hasLoadAttempted, setHasLoadAttempted] = useState(false);

  useEffect(() => {
    console.log("ProfileLoadingHandler - mounting");
    let isMounted = true;
    
    // Start loading data
    const loadData = async () => {
      try {
        await loadProfileData();
        if (isMounted) {
          setIsLoading(false);
          setHasLoadAttempted(true);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        if (isMounted && onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
        if (isMounted) {
          setIsLoading(false);
          setHasLoadAttempted(true);
        }
      }
    };
    
    // Set a timeout to stop showing loading state after a set time
    // This ensures the UI doesn't get stuck in a loading state
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("ProfileLoadingHandler - loading timed out");
        setLoadingTimedOut(true);
        setIsLoading(false);
      }
    }, loadingTimeout);
    
    loadData();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [loadProfileData, onError, loadingTimeout]);

  // Show loading state only if actually loading and not timed out
  if (isLoading && !loadingTimedOut) {
    return <LoadingState />;
  }
  
  // Even if loading timed out, we should show the children to avoid a stuck UI
  return <>{children}</>;
}
