
import { useState } from "react";
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

  const handleFindMatch = async () => {
    // Guard against multiple simultaneous calls
    if (isLoading) return;
    
    try {
      // Set internal loading state first
      setIsLoading(true);
      
      // Then notify parent after a short delay to prevent flash
      setTimeout(() => {
        onStartLoading();
      }, 50);
      
      // Force a significant delay before starting the match finding process
      // This ensures the UI has fully transitioned to loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const matches = await findMatches();
      
      // Give a toast notification
      toast({
        title: "Matches found!",
        description: `Found ${matches.length} potential roommates for you.`,
      });
      
      // Add a longer delay before removing loading state to ensure stability
      setTimeout(() => {
        // Ensure both internal and parent loading states are updated
        setIsLoading(false);
        
        // Delay scrolling and final state update slightly
        setTimeout(() => {
          const resultsElement = document.querySelector('[data-results-section]');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth' });
          }
          
          // Final loading state cleared
          onFinishLoading();
        }, 200);
      }, 600);
      
    } catch (error) {
      console.error("Error finding matches:", error);
      
      // Add delay before resetting loading states to prevent UI flashing
      setTimeout(() => {
        // Reset loading states in case of error
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
      }, 600);
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
