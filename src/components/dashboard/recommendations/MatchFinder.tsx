
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
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleFindMatch = async () => {
    // Guard against multiple simultaneous calls
    if (isLoading) return;
    
    try {
      // Set local loading state
      setIsLoading(true);
      onStartLoading();
      
      // Add a deliberate delay for a better user experience
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const matches = await findMatches();
      
      if (isMountedRef.current) {
        toast({
          title: "Matches found!",
          description: `Found ${matches.length} potential roommates for you.`,
        });
        
        // Clear loading state after a short delay
        timeoutRef.current = window.setTimeout(() => {
          if (isMountedRef.current) {
            setIsLoading(false);
            onFinishLoading();
            
            // Scroll to results section with a small delay
            timeoutRef.current = window.setTimeout(() => {
              if (isMountedRef.current) {
                const resultsElement = document.querySelector('[data-results-section]');
                if (resultsElement) {
                  resultsElement.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }, 300);
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error finding matches:", error);
      
      if (isMountedRef.current) {
        // Clear loading states
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
