
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { LoadingButton } from "./chat/LoadingButton";
import { ProfileFormValues } from "@/types/profile";
import { MatchResult } from "@/utils/matchingAlgorithm/types";

interface MatchFinderProps {
  profileData: Partial<ProfileFormValues> | null;
  findMatches: () => Promise<MatchResult[]>;
  onStartLoading: () => void;
  onFinishLoading: () => void;
  onError?: (error: Error) => void;
}

export function MatchFinder({ 
  profileData, 
  findMatches, 
  onStartLoading, 
  onFinishLoading, 
  onError 
}: MatchFinderProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Setup the mounted ref when component mounts
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      clearTimeouts();
    };
  }, []);

  // Cleanup function for component unmount
  const clearTimeouts = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleFindMatch = async () => {
    // Guard against multiple simultaneous calls
    if (isLoading) return;
    
    try {
      // Clear any existing timeouts first
      clearTimeouts();
      
      // Set local loading state immediately
      setIsLoading(true);
      
      // Use requestAnimationFrame to sync state updates with browser paint cycle
      requestAnimationFrame(() => {
        onStartLoading();
      });
      
      // Create a deliberate delay for user experience
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const matches = await findMatches();
      
      // Success notification only if component is still mounted
      if (isMountedRef.current) {
        toast({
          title: "Matches found!",
          description: `Found ${matches.length} potential roommates for you.`,
        });
        
        // Add delay before finishing to ensure smooth transitions
        timeoutRef.current = window.setTimeout(() => {
          if (!isMountedRef.current) return;
          
          // Reset local loading state
          setIsLoading(false);
          
          // Delay scrolling and final update
          timeoutRef.current = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            
            const resultsElement = document.querySelector('[data-results-section]');
            if (resultsElement) {
              resultsElement.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Final loading state cleared
            requestAnimationFrame(() => {
              onFinishLoading();
            });
          }, 500);
        }, 800);
      }
      
    } catch (error) {
      console.error("Error finding matches:", error);
      
      // Only process error if component is still mounted
      if (isMountedRef.current) {
        // Add delay before resetting loading states
        timeoutRef.current = window.setTimeout(() => {
          if (!isMountedRef.current) return;
          
          // Reset loading states
          setIsLoading(false);
          
          requestAnimationFrame(() => {
            onFinishLoading();
          });
          
          if (onError) {
            onError(error instanceof Error ? error : new Error("Failed to find matches"));
          }
          
          toast({
            title: "Error",
            description: "Failed to find matches. Please try again.",
            variant: "destructive",
          });
        }, 800);
      }
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <LoadingButton 
        isLoading={isLoading} 
        onClick={handleFindMatch} 
      />
    </div>
  );
}
