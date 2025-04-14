
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { ProfileFormValues } from "@/types/profile";
import { fetchRoommateProfile } from "@/services/roommateService";

export function useRoommateProfile() {
  const { user } = useAuth();
  const { showError } = useToastNotifications();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);

  const loadProfileData = async (): Promise<void> => {
    if (!user) {
      console.log("No user found, skipping profile data load in useRoommateProfile");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log("Loading profile data for user:", user.id);
      
      const { data, error } = await fetchRoommateProfile(user.id);
      
      if (error) {
        console.error("Error fetching roommate profile:", error);
        showError(
          "Error loading profile",
          "Could not load your profile data. Please try again."
        );
        setLoading(false);
        return;
      }
      
      if (data && data.profile_data) {
        console.log("Fetched roommate profile successfully");
        
        // Convert moveInDate from string to Date if it exists
        const parsedProfileData = {
          ...data.profile_data,
          moveInDate: data.profile_data.moveInDate 
            ? new Date(data.profile_data.moveInDate) 
            : new Date()
        };
        
        setProfileData(parsedProfileData);
        console.log("Profile data set successfully");
      } else {
        // If no profile exists yet, use default values
        console.log("No existing profile found, using default values");
        const defaultData = getDefaultProfileData();
        setProfileData(defaultData);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      showError(
        "Error loading profile",
        "Could not load your profile data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load profile data on mount
  useEffect(() => {
    console.log("useRoommateProfile useEffect triggered, user:", user?.id);
    if (user) {
      console.log("User detected, loading profile data");
      loadProfileData();
    } else {
      console.log("No user detected, skipping profile data load");
      setLoading(false);
    }
  }, [user]);

  // Helper function to get default profile data
  const getDefaultProfileData = (): Partial<ProfileFormValues> => {
    return {
      fullName: "",
      age: "",
      gender: "",
      email: user?.email || "",
      phoneNumber: "",
      budgetRange: [900, 1500],
      preferredLocation: "",
      moveInDate: new Date(),
      dailyRoutine: "mixed",
      cleanliness: "somewhatTidy",
      hasPets: false,
      smoking: false,
      guestsOver: "occasionally",
      hobbies: [],
      importantRoommateTraits: [],
      // Default values for the new fields
      lifestylePreferences: {
        similarSchedule: false,
        similarInterests: false,
        compatibleWorkStyle: false
      },
      houseHabits: {
        cleansKitchen: false,
        respectsQuietHours: false,
        sharesGroceries: false
      },
      dealBreakers: {
        noSmoking: false,
        noLoudMusic: false,
        noLatePayments: false
      }
    };
  };

  return {
    loading,
    profileData,
    setProfileData,
    loadProfileData
  };
}
