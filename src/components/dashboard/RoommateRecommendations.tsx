import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { ProfileLoadingHandler } from "./recommendations/ProfileLoadingHandler";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Card } from "../ui/card";
import { Sparkles } from "lucide-react";


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
    <div className="w-full max-w-screen-xl mx-auto px-4 space-y-10 pb-10">

      {/* ==========================
          HERO BANNER (Homepage style)
      =========================== */}
      <section className="
        rounded-2xl 
        bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#C084FC]
        px-8 py-10 
        text-white 
        shadow-lg
      ">
        <div className="space-y-4">
          <span className="
            inline-flex items-center gap-2 
            px-4 py-1 
            bg-white/20 
            rounded-full 
            text-xs font-medium tracking-wide
            border border-white/30
          ">
            <Sparkles size={16} /> AI-Powered Matching
          </span>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Find Your Ideal Roommate
          </h1>

          <p className="text-white/85 text-base md:text-lg max-w-2xl">
            Update your lifestyle, schedule and budget preferences. 
            Our AI will match you with compatible potential roommates.
          </p>
        </div>
      </section>

      {/* ==========================
          MAIN CONTENT CARD
      =========================== */}
      <Card className="p-6 md:p-8 shadow-sm border border-border/40">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Start Matching
            </h2>

            <p className="text-sm text-muted-foreground max-w-2xl">
              Complete your profile and let our recommendation system find roommates
              that align with your lifestyle and living preferences.
            </p>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Lifestyle, habits & personality compatibility</li>
            <li>• Budget range & preferred locations</li>
            <li>• Move-in date & schedule matching</li>
          </ul>

          <div className="pt-4">
            <Link to="/dashboard/matches">
              <Button size="lg" className="w-full sm:w-auto">
                Find My Matches
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
