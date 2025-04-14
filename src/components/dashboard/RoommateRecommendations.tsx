
import { useState, useEffect } from "react";
import { Accordion } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { useAccordionSections } from "@/hooks/useAccordionSections";
import { LoadingState } from "./recommendations/LoadingState";
import { AboutMeSection } from "./recommendations/AboutMeSection";
import { IdealRoommateSection } from "./recommendations/IdealRoommateSection";
import { AIAssistantSection } from "./recommendations/AIAssistantSection";
import { ResultsSection } from "./recommendations/ResultsSection";
import { useAuth } from "@/hooks/useAuth";

export function RoommateRecommendations() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeAboutMeTab, setActiveAboutMeTab] = useState("personal-info");
  const [activeIdealRoommateTab, setActiveIdealRoommateTab] = useState("preferences");
  const [isFindingMatches, setIsFindingMatches] = useState(false);
  
  // Custom hooks
  const { 
    loading, 
    profileData, 
    roommates, 
    properties, 
    selectedMatch, 
    activeTab, 
    setActiveTab,
    handleViewDetails,
    handleCloseDetails,
    findMatches,
    handleSaveProfile,
    loadProfileData
  } = useRoommateMatching();
  
  const { expandedSections, setExpandedSections } = useAccordionSections(["about-me", "ideal-roommate", "ai-assistant"]);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access your roommate profile",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const onHandleSaveProfile = async (formData: ProfileFormValues) => {
    try {
      await handleSaveProfile(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFindMatch = async () => {
    try {
      setIsFindingMatches(true);
      // Wait for a moment to show the loading state
      setTimeout(async () => {
        await findMatches();
        setIsFindingMatches(false);
        toast({
          title: "Matches found!",
          description: "We've found some potential roommates for you.",
        });
      }, 1500);
    } catch (error) {
      console.error("Error finding matches:", error);
      setIsFindingMatches(false);
      toast({
        title: "Error",
        description: "Failed to find matches. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshProfile = async () => {
    try {
      await loadProfileData();
      toast({
        title: "Profile refreshed",
        description: "Your profile has been updated with the latest data",
      });
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast({
        title: "Error",
        description: "Failed to refresh profile data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || isFindingMatches) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Find My Ideal Roommate</h1>
        {user && (
          <button 
            onClick={handleRefreshProfile}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            Refresh Profile
          </button>
        )}
      </div>
      <p className="text-muted-foreground">
        Let's find you the perfect roommate match based on your preferences!
      </p>
      
      <div className="space-y-6">
        {/* Accordion sections */}
        <Accordion 
          type="multiple" 
          value={expandedSections} 
          onValueChange={setExpandedSections}
          className="w-full"
        >
          <AboutMeSection
            expandedSections={expandedSections}
            profileData={profileData}
            activeAboutMeTab={activeAboutMeTab}
            setActiveAboutMeTab={setActiveAboutMeTab}
            handleSaveProfile={onHandleSaveProfile}
          />

          <IdealRoommateSection
            expandedSections={expandedSections}
            profileData={profileData}
            activeIdealRoommateTab={activeIdealRoommateTab}
            setActiveIdealRoommateTab={setActiveIdealRoommateTab}
            handleSaveProfile={onHandleSaveProfile}
          />

          <AIAssistantSection
            expandedSections={expandedSections}
            onFindMatch={handleFindMatch}
          />
        </Accordion>

        {/* Results Section - Only show if there are matches */}
        {roommates && roommates.length > 0 && (
          <ResultsSection
            roommates={roommates}
            properties={properties || []}
            selectedMatch={selectedMatch}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onViewDetails={handleViewDetails}
            onCloseDetails={handleCloseDetails}
          />
        )}
      </div>
    </div>
  );
}
