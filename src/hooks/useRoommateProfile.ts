
import { useState, useEffect, useCallback, useRef } from "react";
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
  const loadingTimerRef = useRef<number | null>(null);

  // Clear any pending timers on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current !== null) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const loadProfileData = useCallback(async () => {
    // Prevent duplicate loading attempts
    if (loading && hasAttemptedLoad) return;
    
    // Set initial loading state
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        // Use default profile data if no user
        setProfileData(getDefaultProfileData());
        
        // Set a timeout to ensure loading state persists for long enough
        if (loadingTimerRef.current !== null) {
          clearTimeout(loadingTimerRef.current);
        }
        
        loadingTimerRef.current = window.setTimeout(() => {
          setLoading(false);
          setHasAttemptedLoad(true);
          loadingTimerRef.current = null;
        }, 800);
        
        return;
      }
      
      const { data, error: fetchError } = await fetchRoommateProfile(user.id);
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch profile: ${fetchError.message}`);
      }
      
      if (data) {
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
        } else {
          // Otherwise use defaults
          setProfileData(getDefaultProfileData());
        }
      } else {
        // If no profile exists yet, use default values
        setProfileData(getDefaultProfileData());
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Unknown error loading profile"));
      
      // Set default data even on error to prevent UI from breaking
      setProfileData(getDefaultProfileData());
      
      // Only show toast for errors other than "not found"
      if (error instanceof Error && !error.message.includes("not found")) {
        toast({
          title: "Error loading profile",
          description: "Could not load your profile data. Default values will be used.",
          variant: "destructive",
        });
      }
    } finally {
      // Use a consistent timeout for loading state
      if (loadingTimerRef.current !== null) {
        clearTimeout(loadingTimerRef.current);
      }
      
      loadingTimerRef.current = window.setTimeout(() => {
        setLoading(false);
        setHasAttemptedLoad(true);
        loadingTimerRef.current = null;
      }, 800);
    }
  }, [user, toast, loading, hasAttemptedLoad]);

  // Load profile data on mount with stable loading state
  useEffect(() => {
    if (!hasAttemptedLoad) {
      // Add a consistent initial delay to prevent immediate state changes
      const loadTimer = setTimeout(() => {
        loadProfileData();
      }, 300);
      
      return () => clearTimeout(loadTimer);
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
