
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion"; // Import the Accordion component
import { AboutMeSection } from "./recommendations/AboutMeSection";
import { IdealRoommateSection } from "./recommendations/IdealRoommateSection";
import { ResultsSection } from "./recommendations/ResultsSection";
import { ProfileLoadingHandler } from "./recommendations/ProfileLoadingHandler";
import { AIAssistantSection } from "./recommendations/AIAssistantSection";
import { MatchFinder } from "./recommendations/MatchFinder";
import { EmptyState } from "./recommendations/EmptyState";
import { ChatInterface } from "./recommendations/chat/ChatInterface";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { ProfileFormValues } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  
  // Mark component as mounted after initial render
  useEffect(() => {
    console.log("RoommateRecommendations component mounted");
    setComponentMounted(true);
    
    return () => {
      console.log("RoommateRecommendations component unmounted");
    };
  }, []);
  
  const handleStartLoading = useCallback(() => {
    console.log("RoommateRecommendations - Start loading");
    setIsLoading(true);
  }, []);
  
  const handleFinishLoading = useCallback(() => {
    console.log("RoommateRecommendations - Finish loading");
    setIsLoading(false);
    setHasSearched(true);
  }, []);
  
  const handleTabChange = useCallback((value: string) => {
    console.log(`RoommateRecommendations - Tab changed to ${value}`);
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
    
    // Force a reload of profile data
    loadProfileData()
      .then(() => {
        setIsRetrying(false);
      })
      .catch(err => {
        handleError(err instanceof Error ? err : new Error(String(err)));
        setIsRetrying(false);
      });
  }, [loadProfileData, handleError]);

  // Wrapper function that properly converts the return type
  const onSaveProfile = async (formData: ProfileFormValues): Promise<void> => {
    try {
      console.log("RoommateRecommendations - Saving profile data");
      await handleSaveProfile(formData);
      return Promise.resolve();
    } catch (error) {
      console.error("Error in onSaveProfile:", error);
      const errorObj = error instanceof Error ? error : new Error("Failed to save profile");
      handleError(errorObj);
      return Promise.reject(errorObj);
    }
  };

  if (!componentMounted || !initialized) {
    console.log("RoommateRecommendations - Not fully initialized yet, showing loading");
    return <div className="w-full py-12 flex justify-center items-center min-h-[400px]">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Loading recommendations...</p>
      </div>
    </div>;
  }

  // Render error state if there's an error
  if (internalError) {
    return (
      <Card className="w-full my-6">
        <CardContent className="py-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Content</h2>
            <p className="mb-6">{internalError.message || "An unexpected error occurred"}</p>
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="mx-auto flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="about-me">About Me</TabsTrigger>
                <TabsTrigger value="ideal-roommate">Ideal Roommate</TabsTrigger>
                <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about-me">
                <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
                  <AboutMeSection
                    profileData={profileData}
                    onSaveProfile={onSaveProfile}
                  />
                </Accordion>
              </TabsContent>
              
              <TabsContent value="ideal-roommate">
                <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
                  <IdealRoommateSection
                    profileData={profileData}
                    onSaveProfile={onSaveProfile}
                  />
                </Accordion>
              </TabsContent>
              
              <TabsContent value="ai-assistant">
                <ChatInterface matchingProfileData={profileData} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <MatchFinder
          profileData={profileData}
          findMatches={findMatches}
          onStartLoading={handleStartLoading}
          onFinishLoading={handleFinishLoading}
          onError={handleError}
        />
        
        {hasSearched ? (
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
        ) : null}
      </div>
    </ProfileLoadingHandler>
  );
}
