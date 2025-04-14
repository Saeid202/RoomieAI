
import { useState, useEffect } from "react";
import { Accordion } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { useAccordionSections } from "@/hooks/useAccordionSections";
import { LoadingState } from "./recommendations/LoadingState";
import { AboutMeSection } from "./recommendations/AboutMeSection";
import { IdealRoommateSection } from "./recommendations/IdealRoommateSection";
import { AIAssistantSection } from "./recommendations/AIAssistantSection";
import { ResultsSection } from "./recommendations/ResultsSection";
import { useAuth } from "@/hooks/useAuth";
import { ProfileLoadingHandler } from "./recommendations/ProfileLoadingHandler";
import { MatchFinder } from "./recommendations/MatchFinder";
import { ProfileRefreshButton } from "./recommendations/ProfileRefreshButton";
import { ProfileSaveHandler } from "./recommendations/ProfileSaveHandler";

interface RoommateRecommendationsProps {
  onError?: (error: Error) => void;
}

export function RoommateRecommendations({ onError }: RoommateRecommendationsProps) {
  const { user } = useAuth();
  const [activeAboutMeTab, setActiveAboutMeTab] = useState("personal-info");
  const [activeIdealRoommateTab, setActiveIdealRoommateTab] = useState("preferences");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  
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

  // Avoid state changes that could cause flashing
  useEffect(() => {
    if (!loading && profileData) {
      // Use RAF for better sync with browser rendering cycle
      // This helps prevent flashing by ensuring we're updating in sync with the paint cycle
      requestAnimationFrame(() => {
        // Use a timeout only after RAF to ensure smooth transition
        setTimeout(() => {
          setContentReady(true);
        }, 300);
      });
    }
  }, [loading, profileData]);

  // Combine loading states to prevent multiple renders
  const isLoading = isPageLoading || loading || !contentReady;

  // Show loading state with a single condition to prevent flicker
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Find My Ideal Roommate</h1>
        {user && (
          <ProfileRefreshButton 
            onRefresh={loadProfileData} 
            onError={onError} 
          />
        )}
      </div>
      <p className="text-muted-foreground">
        Let's find you the perfect roommate match based on your preferences!
      </p>
      
      <ProfileLoadingHandler loadProfileData={loadProfileData} onError={onError}>
        <ProfileSaveHandler 
          handleSaveProfile={handleSaveProfile} 
          loadProfileData={loadProfileData}
        >
          {(onHandleSaveProfile) => (
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
                  onFindMatch={() => {}}
                  profileData={profileData}
                >
                  <MatchFinder 
                    profileData={profileData}
                    findMatches={findMatches}
                    onStartLoading={() => setIsPageLoading(true)}
                    onFinishLoading={() => setIsPageLoading(false)}
                    onError={onError}
                  />
                </AIAssistantSection>
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
          )}
        </ProfileSaveHandler>
      </ProfileLoadingHandler>
    </div>
  );
}
