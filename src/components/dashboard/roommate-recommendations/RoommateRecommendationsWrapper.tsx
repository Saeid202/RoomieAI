
import { useState, useEffect } from "react";
import { ProfileFormValues } from "@/types/profile";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { useAuth } from "@/hooks/useAuth";
import { RoommateProfilePage } from "./RoommateProfilePage";
import { LoadingState } from "../recommendations/LoadingState";
import { EmptyState } from "../recommendations/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function RoommateRecommendationsWrapper() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastNotifications();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
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
        setErrorMessage("");
        
        // Check if user is authenticated
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
        setErrorMessage(error instanceof Error ? error.message : "Failed to load profile data");
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

  const handleRefreshProfile = async (): Promise<void> => {
    try {
      setIsPageLoading(true);
      setHasError(false);
      await loadProfileData();
      showSuccess(
        "Profile refreshed",
        "Your profile has been updated with the latest data"
      );
    } catch (error) {
      console.error("Error refreshing profile:", error);
      setHasError(true);
      showError(
        "Error",
        "Failed to refresh profile data. Please try again."
      );
    } finally {
      setIsPageLoading(false);
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

  if (isPageLoading || loading) {
    return <LoadingState />;
  }

  if (hasError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error loading the roommate recommendations. Please try refreshing the page.
            {errorMessage && <div className="mt-2">{errorMessage}</div>}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <EmptyState 
            title="Error loading profile"
            description="We encountered an error while loading your profile. Please try refreshing the page."
            icon="alert"
          />
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
