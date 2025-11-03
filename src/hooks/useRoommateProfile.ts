
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { mapDbDataToFormSchema } from "@/services/mapDbDataToFormSchema";

export function useRoommateProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [loadCounter, setLoadCounter] = useState(0);

  const loadProfileData = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous loads
    if (loading && loadCounter > 0) {
      console.log("Already loading profile data, skipping duplicate request");
      return Promise.resolve();
    }
    
    setLoadCounter(prev => prev + 1);
    
    if (!user) {
      console.log("No user found, using default profile data");
      setLoading(false);
      setProfileData(getDefaultProfileData());
      setHasAttemptedLoad(true);
      return Promise.resolve();
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Loading profile data for user:", user.id);
      
      // Set a timeout to prevent UI from being blocked for too long
      let hasCompleted = false;
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          if (!hasCompleted) {
            console.log("Profile data load timeout, using default data");
            setProfileData(getDefaultProfileData());
            setLoading(false);
            hasCompleted = true;
            resolve();
          }
        }, 2000);
      });
      
      // Fetch profile data from roommate table
      const fetchPromise = supabase
        .from('roommate')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data, error: fetchError }) => {
          if (!hasCompleted) {
            // Gracefully handle table not found error (42P01) - this means roommate table doesn't exist yet
            if (fetchError && fetchError.code === '42P01') {
              console.warn("Roommate table does not exist yet. Using default profile data.");
              setProfileData(getDefaultProfileData());
              hasCompleted = true;
              return;
            }
            
            if (fetchError && fetchError.code !== 'PGRST116') {
              console.error("Error fetching roommate profile:", fetchError);
              throw new Error(`Failed to fetch profile: ${fetchError.message}`);
            }
            
            if (data) {
              console.log("Fetched roommate profile:", data);
              
              // Use mapping function to convert database data to form format
              const profileData = mapDbDataToFormSchema(data, user.email || "");
              
              setProfileData(profileData);
              console.log("Set profile data from database:", profileData);
            } else {
              // If no profile exists yet, use default values
              console.log("No existing profile found, using default values");
              setProfileData(getDefaultProfileData());
            }
            hasCompleted = true;
          }
        });
      
      // Race between timeout and fetch
      await Promise.race([fetchPromise, timeoutPromise]);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error loading profile data:", error);
      setError(error instanceof Error ? error : new Error("Unknown error loading profile"));
      
      // Set default data even on error to prevent UI from breaking
      setProfileData(getDefaultProfileData());
      return Promise.reject(error);
    } finally {
      setHasAttemptedLoad(true);
      setLoading(false);
    }
  }, [user, toast, loading, loadCounter]);

  // Load profile data on mount - with optimization to load faster
  useEffect(() => {
    if (!hasAttemptedLoad) {
      // Set default data immediately to ensure UI can render
      setProfileData(getDefaultProfileData());
      
      if (user) {
        console.log("User detected, loading profile data");
        loadProfileData().catch(err => {
          console.error("Failed to load profile data on mount:", err);
        });
      } else {
        console.log("No user detected, using default profile data");
        setLoading(false);
        setHasAttemptedLoad(true);
      }
    }
  }, [user, loadProfileData, hasAttemptedLoad]);

  // Helper function to get default profile data
  const getDefaultProfileData = (): Partial<ProfileFormValues> => {
    return {
      fullName: "",
      age: "",
      gender: "",
      email: user?.email || "",
      phoneNumber: "",
      budgetRange: [900, 1500],
      preferredLocation: [],
      moveInDateStart: new Date(),
      housingType: "apartment",
      livingSpace: "privateRoom",
      smoking: false,
      livesWithSmokers: false,
      hasPets: false,
      petType: "",
      workLocation: "remote",
      workSchedule: "dayShift",
      hobbies: [],
      diet: "noPreference",
      profileVisibility: [],
      // Ideal roommate preferences with default values
      ageRangePreference: [18, 65],
      genderPreference: [],
      nationalityPreference: "noPreference",
      nationalityCustom: "",
      languagePreference: "noPreference",
      languageSpecific: "",
      dietaryPreferences: "noPreference",
      dietaryOther: "",
      ethnicityPreference: "noPreference",
      ethnicityOther: "",
      religionPreference: "noPreference",
      religionOther: "",
      occupationPreference: false,
      occupationSpecific: "",
      workSchedulePreference: "noPreference",
      petPreference: "noPets",
      petSpecification: "",
      smokingPreference: "noSmoking",
      roommateHobbies: [],
      rentOption: "findTogether",
      occupation: "",
      // Default importance values
      age_range_preference_importance: "notImportant" as const,
      gender_preference_importance: "notImportant" as const,
      nationality_preference_importance: "notImportant" as const,
      language_preference_importance: "notImportant" as const,
      dietary_preferences_importance: "notImportant" as const,
      occupation_preference_importance: "notImportant" as const,
      work_schedule_preference_importance: "notImportant" as const,
      ethnicity_preference_importance: "notImportant" as const,
      religion_preference_importance: "notImportant" as const,
      pet_preference_importance: "notImportant" as const,
      smoking_preference_importance: "notImportant" as const,
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
