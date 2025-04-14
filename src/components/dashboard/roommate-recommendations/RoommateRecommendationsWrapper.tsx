
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

  // Wrapper functions with the correct return type
  const wrappedFindMatches = async (): Promise<void> => {
    await findMatches(profileData);
  };

  const wrappedSaveProfile = async (formData: ProfileFormValues): Promise<void> => {
    await handleSaveProfile(formData);
  };

  if (isPageLoading || loading) {
    return <LoadingState />;
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
