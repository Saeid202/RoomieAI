
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
    try {
      // Set loading states before doing anything else
      setIsLoading(true);
      onStartLoading();
      
      // Allow loading state to fully propagate before proceeding
      // This prevents UI from flashing between states
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const matches = await findMatches();
      
      // Give a toast notification
      toast({
        title: "Matches found!",
        description: `Found ${matches.length} potential roommates for you.`,
      });
      
      // Scroll smoothly to results after we're sure they're rendered
      setTimeout(() => {
        const resultsElement = document.querySelector('[data-results-section]');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Only update loading state after everything is complete
        setIsLoading(false);
        onFinishLoading();
      }, 300);
      
    } catch (error) {
      console.error("Error finding matches:", error);
      
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
