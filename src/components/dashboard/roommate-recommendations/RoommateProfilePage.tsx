
import { ProfileFormValues } from "@/types/profile";
import { useAccordionSections } from "@/hooks/useAccordionSections";
import { useState } from "react";
import { Header } from "../recommendations/Header";
import { AccordionSections } from "../recommendations/AccordionSections";
import { Results } from "../recommendations/Results";

interface RoommateProfilePageProps {
  profileData: Partial<ProfileFormValues> | null;
  roommates: any[];
  properties: any[];
  selectedMatch: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleViewDetails: (match: any) => void;
  handleCloseDetails: () => void;
  findMatches: () => Promise<void>;
  handleSaveProfile: (formData: ProfileFormValues) => Promise<void>;
  handleRefreshProfile: () => Promise<void>;
  user: any;
}

export function RoommateProfilePage({
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
  handleRefreshProfile,
  user
}: RoommateProfilePageProps) {
  const [activeAboutMeTab, setActiveAboutMeTab] = useState("personal-info");
  const [activeIdealRoommateTab, setActiveIdealRoommateTab] = useState("preferences");
  const { expandedSections, setExpandedSections } = useAccordionSections(["about-me", "ideal-roommate", "future-housing-plan", "ai-assistant"]);

  const onHandleSaveProfile = async (formData: ProfileFormValues) => {
    try {
      console.log("Saving profile from RoommateRecommendations:", formData);
      
      if (!user) {
        throw new Error("Authentication required");
      }
      
      await handleSaveProfile(formData);
      
      // Don't return a boolean
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  };

  const handleFindMatch = async () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await findMatches();
      setTimeout(() => {
        const resultsElement = document.querySelector('[data-results-section]');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    } catch (error) {
      console.error("Error finding matches:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-8">
      <Header 
        onRefreshProfile={handleRefreshProfile}
        isAuthenticated={!!user}
      />
      
      <p className="text-muted-foreground">
        Let's find you the perfect roommate match based on your preferences!
      </p>
      
      <div className="space-y-6">
        <AccordionSections
          expandedSections={expandedSections}
          setExpandedSections={setExpandedSections}
          profileData={profileData}
          activeAboutMeTab={activeAboutMeTab}
          setActiveAboutMeTab={setActiveAboutMeTab}
          activeIdealRoommateTab={activeIdealRoommateTab}
          setActiveIdealRoommateTab={setActiveIdealRoommateTab}
          handleSaveProfile={onHandleSaveProfile}
          handleFindMatch={handleFindMatch}
        />

        <Results 
          roommates={roommates || []}
          properties={properties || []}
          selectedMatch={selectedMatch}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onViewDetails={handleViewDetails}
          onCloseDetails={handleCloseDetails}
        />
      </div>
    </div>
  );
}
