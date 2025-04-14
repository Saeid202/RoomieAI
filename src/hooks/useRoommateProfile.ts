
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { fetchRoommateProfile } from "@/services/roommateService";

export function useRoommateProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const loadProfileData = useCallback(async () => {
    if (!user) {
      console.log("No user found, skipping profile data load");
      setLoading(false);
      setProfileData(getDefaultProfileData());
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Loading profile data for user:", user.id);
      
      const { data, error: fetchError } = await fetchRoommateProfile(user.id);
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching roommate profile:", fetchError);
        throw new Error(`Failed to fetch profile: ${fetchError.message}`);
      }
      
      if (data) {
        console.log("Fetched roommate profile:", data);
        // If profile data exists in JSONB field, use it
        if (data.profile_data) {
          // Convert moveInDate from string to Date
          const profileData = {
            ...data.profile_data,
            moveInDate: data.profile_data.moveInDate 
              ? new Date(data.profile_data.moveInDate) 
              : new Date()
          };
          
          setProfileData(profileData);
          console.log("Set profile data from database:", profileData);
        } else {
          // Otherwise use defaults
          setProfileData(getDefaultProfileData());
        }
      } else {
        // If no profile exists yet, use default values
        console.log("No existing profile found, using default values");
        setProfileData(getDefaultProfileData());
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      setError(error instanceof Error ? error : new Error("Unknown error loading profile"));
      
      // Set default data even on error to prevent UI from breaking
      setProfileData(getDefaultProfileData());
      
      toast({
        title: "Error loading profile",
        description: "Could not load your profile data. Default values will be used.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Load profile data on mount
  useEffect(() => {
    if (user) {
      console.log("User detected, loading profile data");
      loadProfileData();
    } else {
      console.log("No user detected, skipping profile data load");
      setLoading(false);
      setProfileData(getDefaultProfileData());
    }
  }, [user, loadProfileData]);

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
      occupation: "Not specified",
      workSchedule: "9AM-5PM",
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
    loadProfileData,
    error
  };
}
