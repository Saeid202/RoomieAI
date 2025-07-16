
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";

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
            if (fetchError && fetchError.code !== 'PGRST116') {
              console.error("Error fetching roommate profile:", fetchError);
              throw new Error(`Failed to fetch profile: ${fetchError.message}`);
            }
            
            if (data) {
              console.log("Fetched roommate profile:", data);
              // Map database fields to form format with proper type assertions
              const profileData: Partial<ProfileFormValues> = {
                fullName: data.full_name || "",
                age: data.age ? String(data.age) : "",
                gender: data.gender || "",
                email: data.email || user.email || "",
                phoneNumber: data.phone_number || "",
                linkedinProfile: data.linkedin_profile || "",
                preferredLocation: data.preferred_location ? data.preferred_location.split(',') : [],
                budgetRange: typeof data.budget_range === 'string' ? [900, 1500] : data.budget_range || [900, 1500],
                moveInDateStart: data.move_in_date ? new Date(data.move_in_date) : new Date(),
                moveInDateEnd: data.move_in_date ? new Date(data.move_in_date) : new Date(),
                housingType: (data.housing_type as "apartment" | "house") || "apartment",
                livingSpace: (data.living_space as "privateRoom" | "sharedRoom" | "entirePlace") || "privateRoom",
                smoking: data.smoking || false,
                livesWithSmokers: data.lives_with_smokers || false,
                hasPets: data.has_pets || false,
                petType: data.pet_preference || "",
                workLocation: (data.work_location as "remote" | "office" | "hybrid") || "remote",
                workSchedule: (data.work_schedule as "dayShift" | "afternoonShift" | "overnightShift") || "dayShift",
                hobbies: data.hobbies || [],
                diet: (data.diet as "vegetarian" | "noRestrictions") || "noRestrictions",
                genderPreference: data.roommate_gender_preference ? [data.roommate_gender_preference] : [],
                nationalityPreference: "noPreference",
                languagePreference: "noPreference",
                ethnicityPreference: "noPreference",
                religionPreference: "noPreference",
                occupationPreference: false,
                workSchedulePreference: (data.roommate_lifestyle_preference as "dayShift" | "overnightShift" | "noPreference" | "opposite" | "nightShift") || "noPreference",
                roommateHobbies: data.important_roommate_traits || [],
                rentOption: "findTogether",
                occupation: data.work_location || "",
              };
              
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
      moveInDateEnd: new Date(),
      housingType: "apartment",
      livingSpace: "privateRoom",
      smoking: false,
      livesWithSmokers: false,
      hasPets: false,
      petType: "",
      workLocation: "remote",
      workSchedule: "dayShift",
      hobbies: [],
      diet: "noRestrictions",
      genderPreference: [],
      nationalityPreference: "noPreference",
      languagePreference: "noPreference",
      ethnicityPreference: "noPreference",
      religionPreference: "noPreference",
      occupationPreference: false,
      workSchedulePreference: "noPreference",
      roommateHobbies: [],
      rentOption: "findTogether",
      occupation: "",
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
