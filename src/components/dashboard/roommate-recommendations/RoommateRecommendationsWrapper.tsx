
import { useState, useEffect } from "react";
import { ProfileFormValues } from "@/types/profile";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { useAuth } from "@/hooks/useAuth";
import { RoommateProfilePage } from "./RoommateProfilePage";
import { LoadingState } from "../recommendations/LoadingState";
import { EmptyState } from "../recommendations/EmptyState";

export function RoommateRecommendationsWrapper() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastNotifications();
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

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        console.log("RoommateRecommendationsWrapper - initializeComponent started");
        setIsPageLoading(true);
        setHasError(false);
        
        if (!user) {
          console.log("No user authenticated, showing unauthenticated state");
          setIsPageLoading(false);
          return;
        }
        
        console.log("Loading roommate profile data...");
        await loadProfileData();
        console.log("Profile data loaded successfully:", profileData);
        
      } catch (error) {
        console.error("Error initializing component:", error);
        setHasError(true);
        showError(
          "Error loading profile",
          "Failed to load your roommate profile data"
        );
      } finally {
        console.log("RoommateRecommendationsWrapper - initializeComponent completed");
        setIsPageLoading(false);
      }
    };
    
    initializeComponent();
  }, [user]);

  useEffect(() => {
    console.log("ProfileData updated in RoommateRecommendationsWrapper:", profileData);
  }, [profileData]);

  const handleRefreshProfile = async (): Promise<void> => {
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

  const wrappedFindMatches = async (): Promise<void> => {
    try {
      console.log("wrappedFindMatches called in RoommateRecommendationsWrapper");
      await findMatches();
      console.log("Find matches completed, roommates:", roommates);
    } catch (error) {
      console.error("Error in wrappedFindMatches:", error);
      showError("Error", "Failed to find matches");
    }
  };

  const wrappedSaveProfile = async (formData: ProfileFormValues): Promise<void> => {
    try {
      console.log("wrappedSaveProfile called with:", formData);
      await handleSaveProfile(formData);
    } catch (error) {
      console.error("Error in wrappedSaveProfile:", error);
      showError("Error", "Failed to save profile");
    }
  };

  console.log("RoommateRecommendationsWrapper - Render state:", { 
    isPageLoading, 
    loading,
    hasError,
    hasUser: !!user,
    hasProfileData: !!profileData 
  });

  if (isPageLoading || loading) {
    return (
      <div>
        <p>Debug: Page is loading, isPageLoading: {isPageLoading.toString()}, loading: {loading.toString()}</p>
        <LoadingState />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6">
        <EmptyState 
          title="Error loading profile"
          description="We encountered an error while loading your profile. Please try refreshing the page."
          icon="alert"
        />
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

  console.log("Rendering RoommateProfilePage with profileData:", profileData);

  return (
    <RoommateProfilePage
      profileData={profileData}
      roommates={roommates}
      properties={properties}
      selectedMatch={selectedMatch}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      handleViewDetails={handleViewDetails}
      handleCloseDetails={handleCloseDetails}
      findMatches={wrappedFindMatches}
      handleSaveProfile={wrappedSaveProfile}
      handleRefreshProfile={handleRefreshProfile}
      user={user}
    />
  );
}
