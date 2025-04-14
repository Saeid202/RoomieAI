
import { useState } from "react";
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

export function RoommateRecommendations() {
  const { toast } = useToast();
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
    handleSaveProfile
  } = useRoommateMatching();
  
  const { expandedSections, setExpandedSections } = useAccordionSections(["about-me", "ideal-roommate", "ai-assistant"]);

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
        setExpandedSections([]); // Close all accordion sections
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

  if (loading || isFindingMatches) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Find My Ideal Roommate</h1>
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
