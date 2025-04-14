
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { fetchRoommateProfile } from "@/services/roommateService";

export function useRoommateProfile() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDoneRef = useRef(false);
  const isMountedRef = useRef(true);

  // Set up mounted ref on component mount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (loadingTimerRef.current !== null) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, []);

  const loadProfileData = useCallback(async () => {
    // Don't attempt loading if auth is still in progress
    if (authLoading) return;
    
    // Prevent duplicate loading attempts
    if (loading && hasAttemptedLoad) return;
    
    // Set initial loading state
    setLoading(true);
    setError(null);
    
    // Clear any existing timers
    if (loadingTimerRef.current !== null) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    // Add a minimum loading time for consistent UX
    const startTime = Date.now();
    const minLoadTime = 1800; // 1.8 seconds minimum loading time
    
    try {
      if (!user) {
        // Use default profile data if no user
        setProfileData(getDefaultProfileData());
        
        // Set a timeout to ensure loading state persists for long enough
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - elapsedTime);
        
        loadingTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          
          requestAnimationFrame(() => {
            setLoading(false);
            setHasAttemptedLoad(true);
            initialLoadDoneRef.current = true;
          });
          
          loadingTimerRef.current = null;
        }, remainingTime);
        
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
      
      // Calculate remaining time to meet minimum loading duration
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);
      
      loadingTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        requestAnimationFrame(() => {
          setLoading(false);
          setHasAttemptedLoad(true);
          initialLoadDoneRef.current = true;
        });
        
        loadingTimerRef.current = null;
      }, remainingTime);
      
    } catch (error) {
      console.error("Error loading profile:", error);
      
      setError(error instanceof Error ? error : new Error("Unknown error loading profile"));
      
      // Set default data even on error to prevent UI from breaking
      setProfileData(getDefaultProfileData());
      
      // Only show toast for errors other than "not found"
      if (isMountedRef.current && error instanceof Error && !error.message.includes("not found")) {
        toast({
          title: "Error loading profile",
          description: "Could not load your profile data. Default values will be used.",
          variant: "destructive",
        });
      }
      
      // Still need to clear loading state after minimum time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);
      
      loadingTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        requestAnimationFrame(() => {
          setLoading(false);
          setHasAttemptedLoad(true);
          initialLoadDoneRef.current = true;
        });
        
        loadingTimerRef.current = null;
      }, remainingTime);
    }
  }, [user, toast, loading, hasAttemptedLoad, authLoading]);

  // Load profile data when auth state stabilizes
  useEffect(() => {
    // Wait for auth to be stable before attempting to load
    if (authLoading || initialLoadDoneRef.current) {
      return;
    }
    
    // Add a consistent initial delay to prevent immediate state changes
    const loadTimer = setTimeout(() => {
      if (isMountedRef.current) {
        loadProfileData();
      }
    }, 800); // Increased delay for smoother loading
    
    return () => clearTimeout(loadTimer);
  }, [authLoading, loadProfileData]);

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
