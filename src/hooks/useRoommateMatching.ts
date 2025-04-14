
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileFormValues } from "@/types/profile";
import { useRoommateProfile } from "@/hooks/useRoommateProfile";
import { useProfileSaving } from "@/hooks/useProfileSaving";
import { useMatching } from "@/hooks/useMatching";
import { useToastNotifications } from "@/hooks/useToastNotifications";

export function useRoommateMatching() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastNotifications();
  const [activeTab, setActiveTab] = useState("roommates");
  
  // Custom sub-hooks
  const { 
    loading: profileLoading, 
    profileData, 
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
      console.log("useRoommateMatching.findMatches called with profileData:", 
        profileData ? { 
          fullName: profileData.fullName, 
          age: profileData.age 
        } : 'null profileData');
      
      if (!profileData) {
        console.error("Profile data is null or undefined in useRoommateMatching.findMatches");
        showError("Profile incomplete", "Please complete your profile before finding matches");
        return;
      }
      
      // Make sure profileData has all required fields for a valid ProfileFormValues
      const completeProfileData: ProfileFormValues = {
        fullName: profileData.fullName || "",
        age: profileData.age || "",
        gender: profileData.gender || "",
        email: profileData.email || user?.email || "",
        phoneNumber: profileData.phoneNumber || "",
        budgetRange: profileData.budgetRange || [900, 1500],
        preferredLocation: profileData.preferredLocation || "",
        moveInDate: profileData.moveInDate || new Date(),
        hobbies: profileData.hobbies || [],
        importantRoommateTraits: profileData.importantRoommateTraits || [],
        
        // Add required fields with default values if they don't exist
        dailyRoutine: profileData.dailyRoutine || "mixed",
        cleanliness: profileData.cleanliness || "somewhatTidy",
        hasPets: profileData.hasPets || false,
        smoking: profileData.smoking || false,
        guestsOver: profileData.guestsOver || "occasionally",
        workSchedule: profileData.workSchedule || "9AM-5PM",
        
        // Add other fields with defaults
        lifestylePreferences: profileData.lifestylePreferences || {
          similarSchedule: false,
          similarInterests: false,
          compatibleWorkStyle: false
        },
        houseHabits: profileData.houseHabits || {
          cleansKitchen: false,
          respectsQuietHours: false,
          sharesGroceries: false
        },
        dealBreakers: profileData.dealBreakers || {
          noSmoking: false,
          noLoudMusic: false,
          noLatePayments: false
        },
        
        // Add any other required fields based on your ProfileFormValues type
        housingType: profileData.housingType || "apartment",
        livingSpace: profileData.livingSpace || "privateRoom",
        livesWithSmokers: profileData.livesWithSmokers || false,
        petPreference: profileData.petPreference || "noPets",
        workLocation: profileData.workLocation || "office",
        sleepSchedule: profileData.sleepSchedule || "",
        overnightGuests: profileData.overnightGuests || "occasionally",
        cleaningFrequency: profileData.cleaningFrequency || "weekly",
        socialLevel: profileData.socialLevel || "balanced",
        familyOver: profileData.familyOver || "occasionally",
        atmosphere: profileData.atmosphere || "balanced",
        hostingFriends: profileData.hostingFriends || "occasionally",
        diet: profileData.diet || "omnivore",
        cookingSharing: profileData.cookingSharing || "separate",
        stayDuration: profileData.stayDuration || "oneYear",
        leaseTerm: profileData.leaseTerm || "longTerm",
        roommateGenderPreference: profileData.roommateGenderPreference || "noPreference",
        roommateAgePreference: profileData.roommateAgePreference || "noAgePreference",
        roommateLifestylePreference: profileData.roommateLifestylePreference || "noLifestylePreference"
      };
      
      console.log("Calling findMatchesInternal with completeProfileData", {
        fullName: completeProfileData.fullName,
        age: completeProfileData.age
      });
      
      await findMatchesInternal(completeProfileData);
    } catch (error) {
      console.error("Error in findMatches wrapper:", error);
      showError("Error", "Failed to find matches. Please try again.");
    }
  };

  return {
    loading: profileLoading || isSaving || isFindingMatches,
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
