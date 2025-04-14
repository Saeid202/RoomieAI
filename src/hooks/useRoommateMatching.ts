
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileFormValues } from "@/types/profile";
import { useRoommateProfile } from "@/hooks/useRoommateProfile";
import { useProfileSaving } from "@/hooks/useProfileSaving";
import { useMatching } from "@/hooks/useMatching";
import { useToast } from "@/hooks/use-toast";

export function useRoommateMatching() {
  const { user } = useAuth();
  const { toast } = useToast();
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
    try {
      console.log("Finding matches with current profile data:", profileData);
      if (!profileData) {
        console.error("Profile data is null or undefined");
        toast({
          title: "Profile incomplete",
          description: "Please complete your profile before finding matches",
          variant: "destructive",
        });
        return;
      }
      
      // Make sure profileData is cast to a complete ProfileFormValues
      const formValues = profileData as ProfileFormValues;
      return await findMatchesInternal(formValues);
    } catch (error) {
      console.error("Error in findMatches wrapper:", error);
      toast({
        title: "Error",
        description: "Failed to find matches. Please try again.",
        variant: "destructive",
      });
    }
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
