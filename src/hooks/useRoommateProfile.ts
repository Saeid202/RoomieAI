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
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          // Instead of rejecting with error, we'll just use default data if timeout occurs
          console.log("Profile data load timeout, using default data");
          setProfileData(getDefaultProfileData());
          setLoading(false);
        }, 2000);
      });
      
      // Fetch profile data
      const fetchPromise = fetchRoommateProfile(user.id).then(({ data, error: fetchError }) => {
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
      ethnicReligionPreference: "noPreference",
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
