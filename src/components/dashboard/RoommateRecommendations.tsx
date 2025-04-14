
import { useState, useEffect } from "react";
import { ProfileFormValues } from "@/types/profile";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { useAccordionSections } from "@/hooks/useAccordionSections";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { LoadingState } from "./recommendations/LoadingState";
import { Header } from "./recommendations/Header";
import { AccordionSections } from "./recommendations/AccordionSections";
import { Results } from "./recommendations/Results";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState } from "./recommendations/EmptyState";

export function RoommateRecommendations() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastNotifications();
  const [activeAboutMeTab, setActiveAboutMeTab] = useState("personal-info");
  const [activeIdealRoommateTab, setActiveIdealRoommateTab] = useState("preferences");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Custom sub-hooks
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
  
  const { expandedSections, setExpandedSections } = useAccordionSections(["about-me", "ideal-roommate", "future-housing-plan", "ai-assistant"]);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setIsPageLoading(true);
        setHasError(false);
        
        if (!user) {
          console.log("No user authenticated, showing unauthenticated state");
          setIsPageLoading(false);
          return;
        }
        
        console.log("Loading roommate profile data...");
        await loadProfileData();
        console.log("Profile data loaded successfully");
        
      } catch (error) {
        console.error("Error initializing component:", error);
        setHasError(true);
        showError(
          "Error loading profile",
          "Failed to load your roommate profile data"
        );
      } finally {
        setIsPageLoading(false);
      }
    };
    
    initializeComponent();
  }, [user]);

  useEffect(() => {
    console.log("ProfileData updated in RoommateRecommendations:", profileData);
  }, [profileData]);

  const onHandleSaveProfile = async (formData: ProfileFormValues) => {
    try {
      console.log("Saving profile from RoommateRecommendations:", formData);
      
      if (!user) {
        showError(
          "Authentication required",
          "You need to be logged in to save your profile"
        );
        return;
      }
      
      await handleSaveProfile(formData);
      await loadProfileData();
      
      showSuccess(
        "Profile updated",
        "Your profile has been saved successfully"
      );
    } catch (error) {
      console.error("Error saving profile:", error);
      showError(
        "Error",
        "Failed to save profile data. Please try again."
      );
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
        
        showSuccess(
          "Matches found!",
          "We've found some potential roommates for you."
        );
        
        setIsPageLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error finding matches:", error);
      setIsPageLoading(false);
      showError(
        "Error",
        "Failed to find matches. Please try again."
      );
    }
  };

  const handleRefreshProfile = async () => {
    try {
      await loadProfileData();
      showSuccess(
        "Profile refreshed",
        "Your profile has been updated with the latest data"
      );
    } catch (error) {
      console.error("Error refreshing profile:", error);
      showError(
        "Error",
        "Failed to refresh profile data. Please try again."
      );
    }
  };

  if (isPageLoading || loading) {
    return <LoadingState />;
  }

  if (hasError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Error loading profile</h3>
          <p className="mt-2 text-red-700">
            We encountered an error while loading your profile. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="Authentication Required"
        description="Please sign in to access your roommate profile and recommendations"
        icon="lock"
      />
    );
  }

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
          roommates={roommates}
          properties={properties}
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
