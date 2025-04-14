
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileFormValues } from "@/types/profile";
import { useRoommateProfile } from "@/hooks/useRoommateProfile";
import { useProfileSaving } from "@/hooks/useProfileSaving";
import { useMatching } from "@/hooks/useMatching";

export function useRoommateMatching() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("roommates");
  
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

  // Wrapper for findMatches that uses the current profileData
  const findMatches = useCallback(async () => {
    if (!profileData) {
      throw new Error("Profile data is not available. Please complete your profile first.");
    }
    
    try {
      return await findMatchesInternal(profileData);
    } catch (error) {
      console.error("Error in findMatches:", error);
      throw error;
    }
  }, [profileData, findMatchesInternal]);

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
    handleSaveProfile,
    loadProfileData
  };
}
