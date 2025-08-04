import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { TabsSection } from "./recommendations/components/TabsSection";
import { ResultsSection } from "./recommendations/ResultsSection";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { ProfileLoadingHandler } from "./recommendations/ProfileLoadingHandler";

interface RoommateRecommendationsProps {
  onError?: (error: Error) => void;
}

export function RoommateRecommendations({ onError }: RoommateRecommendationsProps) {
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const {
    profileData,
    roommates,
    properties,
    selectedMatch,
    activeTab,
    loading,
    setActiveTab,
    handleViewDetails,
    handleCloseDetails,
    findMatches,
    handleSaveProfile,
    loadProfileData,
    initialized
  } = useRoommateMatching();
  
  const handleError = useCallback((error: Error) => {
    console.error("Error in RoommateRecommendations:", error);
    
    toast({
      title: "Error",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
    
    if (onError) {
      onError(error);
    }
  }, [toast, onError]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    if (!expandedSections.includes("about-me") && value === "about-me") {
      setExpandedSections(prev => [...prev, "about-me"]);
    } else if (!expandedSections.includes("ideal-roommate") && value === "ideal-roommate") {
      setExpandedSections(prev => [...prev, "ideal-roommate"]);
    }
  }, [expandedSections, setActiveTab]);

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
            Update your profile and preferences to get matched with potential roommates
          </p>
        </div>
      </div>
      
      {/* Mobile-optimized profile section */}
      <div className="w-full">
        <div className="bg-background/95 backdrop-blur-sm">
          <div className="px-4 py-6 md:p-6">
            <TabsSection
              activeTab={activeTab}
              expandedSections={expandedSections}
              setExpandedSections={setExpandedSections}
              handleTabChange={handleTabChange}
              profileData={profileData}
              onSaveProfile={handleSaveProfile}
            />
          </div>
        </div>
      </div>
      
      {/* Mobile-optimized results section */}
      <div className="w-full">
        <ResultsSection
          roommates={roommates}
          properties={properties}
          selectedMatch={selectedMatch}
          activeTab={activeTab === "about-me" || activeTab === "ideal-roommate" || activeTab === "ai-assistant" 
            ? "roommates" 
            : activeTab}
          setActiveTab={setActiveTab}
          onViewDetails={handleViewDetails}
          onCloseDetails={handleCloseDetails}
        />
      </div>
    </div>
  );
}
