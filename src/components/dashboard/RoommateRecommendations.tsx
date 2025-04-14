
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface RoommateRecommendationsProps {
  onError?: (error: Error) => void;
}

export function RoommateRecommendations({ onError }: RoommateRecommendationsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("about-me");
  
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
    loadProfileData
  } = useRoommateMatching();
  
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
    
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    
    if (onError) {
      onError(error);
    }
  }, [toast, onError]);

  // Wrapper function that properly converts the return type
  const onSaveProfile = async (formData: ProfileFormValues): Promise<void> => {
    try {
      await handleSaveProfile(formData);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error("Failed to save profile"));
      throw error;
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
                <AboutMeSection
                  profileData={profileData}
                  onSaveProfile={onSaveProfile}
                />
              </TabsContent>
              
              <TabsContent value="ideal-roommate">
                <IdealRoommateSection
                  profileData={profileData}
                  onSaveProfile={onSaveProfile}
                />
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
