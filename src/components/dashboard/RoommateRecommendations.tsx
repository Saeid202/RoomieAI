
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileLoadingHandler } from "./recommendations/ProfileLoadingHandler";
import { MatchFinder } from "./recommendations/MatchFinder";
import { EmptyState } from "./recommendations/EmptyState";
import { ResultsSection } from "./recommendations/ResultsSection";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { LoadingAndErrorStates } from "./recommendations/components/LoadingAndErrorStates";
import { TabsSection } from "./recommendations/components/TabsSection";
import { ProfileFormValues } from "@/types/profile";

interface RoommateRecommendationsProps {
  onError?: (error: Error) => void;
}

export function RoommateRecommendations({ onError }: RoommateRecommendationsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("about-me");
  const [componentMounted, setComponentMounted] = useState(false);
  const [internalError, setInternalError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["about-me"]);
  
  const {
    loading: profileLoading,
    profileData,
    roommates,
    properties,
    selectedMatch,
    activeTab: resultsTab,
    setActiveTab: setResultsTab,
    handleViewDetails,
    handleCloseDetails,
    findMatches,
    handleSaveProfile,
    loadProfileData,
    initialized
  } = useRoommateMatching();

  useEffect(() => {
    console.log("RoommateRecommendations component mounted");
    setComponentMounted(true);
    return () => {
      console.log("RoommateRecommendations component unmounted");
    };
  }, []);

  const handleStartLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleFinishLoading = useCallback(() => {
    setIsLoading(false);
    setHasSearched(true);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error("Error in RoommateRecommendations:", error);
    setInternalError(error);
    
    toast({
      title: "Error",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
    
    if (onError) {
      onError(error);
    }
  }, [toast, onError]);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setInternalError(null);
    
    loadProfileData()
      .then(() => {
        setIsRetrying(false);
      })
      .catch(err => {
        handleError(err instanceof Error ? err : new Error(String(err)));
        setIsRetrying(false);
      });
  }, [loadProfileData, handleError]);

  const onSaveProfile = async (formData: ProfileFormValues): Promise<void> => {
    try {
      await handleSaveProfile(formData);
      return Promise.resolve();
    } catch (error) {
      console.error("Error in onSaveProfile:", error);
      const errorObj = error instanceof Error ? error : new Error("Failed to save profile");
      handleError(errorObj);
      return Promise.reject(errorObj);
    }
  };

  return (
    <ProfileLoadingHandler loadProfileData={loadProfileData} onError={handleError}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Find Your Ideal Roommate</h1>
            <p className="text-muted-foreground">
              Complete your profile, tell us about your ideal roommate, and we'll find your perfect match!
            </p>
          </div>
        </div>
        
        <LoadingAndErrorStates
          componentMounted={componentMounted}
          initialized={initialized}
          internalError={internalError}
          isRetrying={isRetrying}
          handleRetry={handleRetry}
        />
        
        {!internalError && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <TabsSection
                activeTab={activeTab}
                expandedSections={expandedSections}
                setExpandedSections={setExpandedSections}
                handleTabChange={handleTabChange}
                profileData={profileData}
                onSaveProfile={onSaveProfile}
              />
            </CardContent>
          </Card>
        )}
        
        <MatchFinder
          profileData={profileData}
          findMatches={findMatches}
          onStartLoading={handleStartLoading}
          onFinishLoading={handleFinishLoading}
          onError={handleError}
        />
        
        {hasSearched && (
          <div data-results-section>
            {roommates.length > 0 || properties.length > 0 ? (
              <ResultsSection
                roommates={roommates}
                properties={properties}
                selectedMatch={selectedMatch}
                activeTab={resultsTab}
                setActiveTab={setResultsTab}
                onViewDetails={handleViewDetails}
                onCloseDetails={handleCloseDetails}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        )}
      </div>
    </ProfileLoadingHandler>
  );
}
