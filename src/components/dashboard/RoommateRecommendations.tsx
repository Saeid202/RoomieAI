import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { ProfileLoadingHandler } from "./recommendations/ProfileLoadingHandler";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface RoommateRecommendationsProps {
  onError?: (error: Error) => void;
}

export function RoommateRecommendations({
  onError,
}: RoommateRecommendationsProps) {
  const { toast } = useToast();

  const { loadProfileData, initialized } = useRoommateMatching();

  const handleError = useCallback(
    (error: Error) => {
      console.error("Error in RoommateRecommendations:", error);

      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });

      if (onError) {
        onError(error);
      }
    },
    [toast, onError]
  );

  if (!initialized) {
    return (
      <ProfileLoadingHandler
        loadProfileData={loadProfileData}
        onError={handleError}
      >
        <div>Loading your profile data...</div>
      </ProfileLoadingHandler>
    );
  }

  return (
    <div className="w-full max-w-none mx-auto space-y-6 md:max-w-screen-xl md:px-4">
      {/* Mobile-optimized header */}
      <div className="px-4 md:px-0">
        <div className="flex flex-col space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Find Your Ideal Roommate
          </h1>
          <p className="text-lg text-muted-foreground">
            Update your profile and preferences to get matched with potential
            roommates
          </p>
        </div>
        <div className="flex justify-center">
          <Link to={"/dashboard/matches"}>
            <Button
              className="mt-5 w-full sm:w-[400px] sm:mt-10"
              variant="secondary"
            >
              Find
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
