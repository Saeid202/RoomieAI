
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileFormValues } from "@/types/profile";
import { useRoommateProfile } from "@/hooks/useRoommateProfile";
import { useProfileSaving } from "@/hooks/useProfileSaving";
import { useMatching } from "@/hooks/useMatching";
import { MatchResult } from "@/utils/matchingAlgorithm/types";

export function useRoommateMatching() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("roommates");
  const [initialized, setInitialized] = useState(false);
  
  // Custom sub-hooks
  const { 
    loading, 
    profileData, 
    setProfileData, 
    loadProfileData 
  } = useRoommateProfile();
  
  const { isSaving, handleSaveProfile } = useProfileSaving();
  
  const { 
    roommates, 
    properties, 
    selectedMatch, 
    isFindingMatches,
    handleViewDetails, 
    handleCloseDetails, 
    findMatches: findMatchesInternal 
  } = useMatching();

  // Mark hook as initialized after first render
  useEffect(() => {
    setInitialized(true);
    return () => {
      console.log("useRoommateMatching - unmounting");
    };
  }, []);

  // Wrapper for findMatches that uses the current profileData
  const findMatches = useCallback(async (): Promise<MatchResult[]> => {
    console.log("useRoommateMatching - findMatches called");
    
    if (!profileData) {
      console.error("Profile data is not available. Please complete your profile first.");
      return Promise.reject(new Error("Profile data is not available. Please complete your profile first."));
    }
    
    try {
      console.log("useRoommateMatching - Calling findMatchesInternal");
      return await findMatchesInternal(profileData);
    } catch (error) {
      console.error("Error in findMatches:", error);
      return Promise.reject(error);
    }
  }, [profileData, findMatchesInternal]);

  // Ensure handleSaveProfile properly returns a Promise<void>
  const saveProfile = useCallback(async (formData: ProfileFormValues): Promise<void> => {
    try {
      console.log("useRoommateMatching - saveProfile called");
      await handleSaveProfile(formData);
      return Promise.resolve();
    } catch (error) {
      console.error("Error in saveProfile:", error);
      return Promise.reject(error);
    }
  }, [handleSaveProfile]);

  return {
    loading: loading || isSaving || isFindingMatches,
    profileData,
    roommates,
    properties,
    selectedMatch,
    activeTab,
    setActiveTab,
    handleViewDetails,
    handleCloseDetails,
    findMatches,
    handleSaveProfile: saveProfile,
    loadProfileData,
    initialized
  };
}
