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
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const loadProfileData = useCallback(async () => {
    // Don't attempt to load if we're already loading
    if (!loading) {
      setLoading(true);
    }
    
    try {
      setError(null);
      
      if (!user) {
        // No user, so use default profile data
        console.log("No user found, using default profile data");
        setProfileData(getDefaultProfileData());
        return;
      }
      
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
      
      // Only show toast if it's not a normal "not found" error
      if (error instanceof Error && !error.message.includes("not found")) {
        toast({
          title: "Error loading profile",
          description: "Could not load your profile data. Default values will be used.",
          variant: "destructive",
        });
      }
    } finally {
      setHasAttemptedLoad(true);
      setLoading(false);
    }
  }, [user, toast]);

  // Load profile data on mount
  useEffect(() => {
    if (!hasAttemptedLoad) {
      const timer = setTimeout(() => {
        loadProfileData();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [hasAttemptedLoad, loadProfileData]);

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
      occupation: "",
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
