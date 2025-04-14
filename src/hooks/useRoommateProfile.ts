import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { fetchRoommateProfile } from "@/services/roommateService";

export function useRoommateProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);

  const loadProfileData = async (): Promise<void> => {
    if (!user) {
      console.log("No user found, skipping profile data load");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log("Loading profile data for user:", user.id);
      
      const { data, error } = await fetchRoommateProfile(user.id);
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching roommate profile:", error);
        throw error;
      }
      
      if (data) {
        console.log("Fetched roommate profile:", data);
        // If profile data exists in JSONB field, use it
        if (data.profile_data) {
          // Convert moveInDate from string to Date
          const parsedProfileData = {
            ...data.profile_data,
            moveInDate: data.profile_data.moveInDate 
              ? new Date(data.profile_data.moveInDate) 
              : new Date()
          };
          
          setProfileData(parsedProfileData);
          console.log("Set profile data from database:", parsedProfileData);
        } else {
          // Otherwise use defaults
          const defaultData = getDefaultProfileData();
          setProfileData(defaultData);
          console.log("Using default profile data:", defaultData);
        }
      } else {
        // If no profile exists yet, use default values
        console.log("No existing profile found, using default values");
        const defaultData = getDefaultProfileData();
        setProfileData(defaultData);
        console.log("Using default profile data:", defaultData);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast({
        title: "Error loading profile",
        description: "Could not load your profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load profile data on mount
  useEffect(() => {
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
