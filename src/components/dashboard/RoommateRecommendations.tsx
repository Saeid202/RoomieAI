
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

interface RoommateRecommendationsProps {
  onError?: (error: Error) => void;
}

export function RoommateRecommendations({ onError }: RoommateRecommendationsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeAboutMeTab, setActiveAboutMeTab] = useState("personal-info");
  const [activeIdealRoommateTab, setActiveIdealRoommateTab] = useState("preferences");
  const [isPageLoading, setIsPageLoading] = useState(false);
  
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
    const fetchData = async () => {
      try {
        await loadProfileData();
      } catch (error) {
        console.error("Error loading profile data:", error);
        if (onError) {
          onError(error instanceof Error ? error : new Error("Failed to load profile data"));
        }
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (user) {
      fetchData();
    } else {
      console.log("User not authenticated:", user);
    }
  }, [user, toast, loadProfileData, onError]);

  useEffect(() => {
    console.log("ProfileData updated in RoommateRecommendations:", profileData);
  }, [profileData]);

  const onHandleSaveProfile = async (formData: ProfileFormValues) => {
    try {
      console.log("Saving profile from RoommateRecommendations:", formData);
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to save your profile",
          variant: "destructive",
        });
        return;
      }
      
      await handleSaveProfile(formData);
      
      await loadProfileData();
      
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsPageLoading(true);
      await findMatches();
      setTimeout(() => {
        const resultsElement = document.querySelector('[data-results-section]');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        toast({
          title: "Matches found!",
          description: "We've found some potential roommates for you.",
        });
        
        setIsPageLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error finding matches:", error);
      setIsPageLoading(false);
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

  const handleRefreshProfile = async () => {
    try {
      await loadProfileData();
      toast({
        title: "Profile refreshed",
        description: "Your profile has been updated with the latest data",
      });
    } catch (error) {
      console.error("Error refreshing profile:", error);
      if (onError) {
        onError(error instanceof Error ? error : new Error("Failed to refresh profile"));
      }
      toast({
        title: "Error",
        description: "Failed to refresh profile data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || isPageLoading) {
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
            profileData={profileData}
          />
        </Accordion>

        {roommates && roommates.length > 0 && (
          <div data-results-section>
            <ResultsSection
              roommates={roommates}
              properties={properties || []}
              selectedMatch={selectedMatch}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onViewDetails={handleViewDetails}
              onCloseDetails={handleCloseDetails}
            />
          </div>
        )}
      </div>
    </div>
  );
}
