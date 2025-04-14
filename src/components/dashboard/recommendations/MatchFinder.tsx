
import { useState, useRef } from "react";
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

  // Cleanup function for component unmount
  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useState(() => {
    return () => {
      isMountedRef.current = false;
      clearTimeouts();
    };
  });

  const handleFindMatch = async () => {
    // Guard against multiple simultaneous calls
    if (isLoading) return;
    
    try {
      // Clear any existing timeouts first
      clearTimeouts();
      
      // Set local loading state immediately
      setIsLoading(true);
      onStartLoading();
      
      // Create a deliberate delay for user experience
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const matches = await findMatches();
      
      // Success notification
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
          onFinishLoading();
        }, 400);
      }, 800);
      
    } catch (error) {
      console.error("Error finding matches:", error);
      
      // Add delay before resetting loading states
      timeoutRef.current = window.setTimeout(() => {
        if (!isMountedRef.current) return;
        
        // Reset loading states
        setIsLoading(false);
        onFinishLoading();
        
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
