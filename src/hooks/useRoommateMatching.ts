
import { useState } from "react";
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
  const findMatches = async (): Promise<void> => {
    console.log("Finding matches with current profile data:", profileData);
    if (!profileData) {
      console.error("Profile data is null or undefined");
      return;
    }
    return await findMatchesInternal(profileData);
  };

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
