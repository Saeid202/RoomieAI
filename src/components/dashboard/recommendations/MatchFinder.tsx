
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
      // Set local loading state first
      setIsLoading(true);
      
      // Notify parent after a slight delay to prevent flash
      setTimeout(() => {
        onStartLoading();
      }, 50);
      
      // Create a deliberate delay for user experience
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const matches = await findMatches();
      
      // Success notification
      toast({
        title: "Matches found!",
        description: `Found ${matches.length} potential roommates for you.`,
      });
      
      // Add delay before finishing to ensure smooth transitions
      setTimeout(() => {
        // Ensure component is still mounted
        setIsLoading(false);
        
        // Delay scrolling and final update
        setTimeout(() => {
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
      setTimeout(() => {
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
