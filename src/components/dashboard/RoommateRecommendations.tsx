
import { useState, useEffect, useRef } from "react";
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
  const [componentMounted, setComponentMounted] = useState(false);
  const mountedRef = useRef(true);
  
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

  // Setup effect that runs only once after initial mount with mandatory delay
  useEffect(() => {
    setComponentMounted(false);
    mountedRef.current = true;
    
    // Use requestAnimationFrame + setTimeout to ensure we're fully rendered and stable
    requestAnimationFrame(() => {
      if (!mountedRef.current) return;
      
      setTimeout(() => {
        if (mountedRef.current) {
          setComponentMounted(true);
        }
      }, 500);
    });
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // If any loading state is active, show loading state
  const isLoading = isPageLoading || loading || !componentMounted;

  if (isLoading || !profileData) {
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
