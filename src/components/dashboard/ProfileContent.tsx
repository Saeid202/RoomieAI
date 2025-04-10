
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client"; 
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PostgrestError } from "@supabase/supabase-js";
import { ProfileFormValues } from "@/types/profile";
import { UserPreference } from "./types";

export function ProfileContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPreference, setUserPreference] = useState<UserPreference>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/');
      return;
    }

    // Get user preference from localStorage
    const savedPreference = localStorage.getItem('userPreference') as UserPreference;
    setUserPreference(savedPreference);

    // Load profile data from Supabase based on preference
    const fetchProfileData = async () => {
      try {
        if (!savedPreference) {
          setLoading(false);
          return;
        }

        // Determine which table to query based on user preference
        let tableName = '';
        if (savedPreference === 'roommate') {
          tableName = 'roommate';
        } else if (savedPreference === 'co-owner') {
          tableName = 'co-owner';
        } else if (savedPreference === 'both') {
          tableName = 'Both';
        }

        if (!tableName) {
          setLoading(false);
          return;
        }

        // Query the appropriate table
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          // Check if it's a PostgrestError with a code property
          const postgrestError = error as PostgrestError;
          // PGRST116 is "Not found" error, which is expected for new users
          if (postgrestError.code !== 'PGRST116') {
            throw error;
          }
        }

        if (data) {
          // Map database field names to ProfileFormValues properties
          const formattedData: Partial<ProfileFormValues> = {
            fullName: data.full_name || "",
            age: data.age || "",
            gender: data.gender || "",
            phoneNumber: data.phone_number || "",
            email: data.email || "",
            linkedinProfile: data.linkedin_profile || "",
            preferredLocation: data.preferred_location || "",
            budgetRange: data.budget_range || [800, 1500],
            moveInDate: data.move_in_date ? new Date(data.move_in_date) : new Date(),
            housingType: (data.housing_type as "house" | "apartment") || "apartment",
            livingSpace: (data.living_space as "privateRoom" | "sharedRoom" | "entirePlace") || "privateRoom",
            smoking: !!data.smoking,
            livesWithSmokers: !!data.lives_with_smokers,
            hasPets: !!data.has_pets,
            petPreference: (data.pet_preference as "noPets" | "onlyCats" | "onlyDogs" | "both") || "noPets",
            workLocation: (data.work_location as "remote" | "office" | "hybrid") || "office",
            dailyRoutine: (data.daily_routine as "morning" | "night" | "mixed") || "morning",
            hobbies: data.hobbies || [],
            workSchedule: data.work_schedule || "",
            sleepSchedule: data.sleep_schedule || "",
            overnightGuests: (data.overnight_guests as "yes" | "no" | "occasionally") || "occasionally",
            cleanliness: (data.cleanliness as "veryTidy" | "somewhatTidy" | "doesntMindMess") || "somewhatTidy",
            cleaningFrequency: (data.cleaning_frequency as "daily" | "weekly" | "biweekly" | "monthly" | "asNeeded") || "weekly",
            socialLevel: (data.social_level as "extrovert" | "introvert" | "balanced") || "balanced",
            guestsOver: (data.guests_over as "yes" | "no" | "occasionally") || "occasionally",
            familyOver: (data.family_over as "yes" | "no" | "occasionally") || "occasionally",
            atmosphere: (data.atmosphere as "quiet" | "lively" | "balanced") || "balanced",
            hostingFriends: (data.hosting_friends as "yes" | "no" | "occasionally") || "occasionally",
            diet: (data.diet as "vegetarian" | "vegan" | "omnivore" | "other") || "omnivore",
            cookingSharing: (data.cooking_sharing as "share" | "separate") || "share",
            stayDuration: (data.stay_duration as "threeMonths" | "sixMonths" | "oneYear" | "flexible") || "oneYear",
            leaseTerm: (data.lease_term as "shortTerm" | "longTerm") || "longTerm",
            roommateGenderPreference: (data.roommate_gender_preference as "sameGender" | "femaleOnly" | "maleOnly" | "noPreference") || "noPreference",
            roommateAgePreference: (data.roommate_age_preference as "similar" | "younger" | "older" | "noAgePreference") || "similar",
            roommateLifestylePreference: (data.roommate_lifestyle_preference as "similar" | "moreActive" | "quieter" | "noLifestylePreference") || "similar",
            importantRoommateTraits: data.important_roommate_traits || [],
          };
          
          setProfileData(formattedData);
        }
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate, toast]);

  const handleSaveProfile = async (formData: ProfileFormValues) => {
    try {
      if (!user || !userPreference) return;
      
      // Prepare data for Supabase - convert camelCase to snake_case for DB columns
      const dbData = {
        id: user.id,
        full_name: formData.fullName,
        age: formData.age,
        gender: formData.gender,
        phone_number: formData.phoneNumber,
        email: formData.email,
        linkedin_profile: formData.linkedinProfile,
        preferred_location: formData.preferredLocation,
        budget_range: formData.budgetRange,
        move_in_date: formData.moveInDate.toISOString(),
        housing_type: formData.housingType,
        living_space: formData.livingSpace,
        smoking: formData.smoking,
        lives_with_smokers: formData.livesWithSmokers,
        has_pets: formData.hasPets,
        pet_preference: formData.petPreference,
        work_location: formData.workLocation,
        daily_routine: formData.dailyRoutine,
        hobbies: formData.hobbies,
        work_schedule: formData.workSchedule,
        sleep_schedule: formData.sleepSchedule,
        overnight_guests: formData.overnightGuests,
        cleanliness: formData.cleanliness,
        cleaning_frequency: formData.cleaningFrequency,
        social_level: formData.socialLevel,
        guests_over: formData.guestsOver,
        family_over: formData.familyOver,
        atmosphere: formData.atmosphere,
        hosting_friends: formData.hostingFriends,
        diet: formData.diet,
        cooking_sharing: formData.cookingSharing,
        stay_duration: formData.stayDuration,
        lease_term: formData.leaseTerm,
        roommate_gender_preference: formData.roommateGenderPreference,
        roommate_age_preference: formData.roommateAgePreference,
        roommate_lifestyle_preference: formData.roommateLifestylePreference,
        important_roommate_traits: formData.importantRoommateTraits,
        updated_at: new Date().toISOString(),
      };

      // Determine which table to save to based on user preference
      let tableName = '';
      if (userPreference === 'roommate') {
        tableName = 'roommate';
      } else if (userPreference === 'co-owner') {
        tableName = 'co-owner';
      } else if (userPreference === 'both') {
        tableName = 'Both';
      }

      if (!tableName) {
        throw new Error("No table selected. Please select a preference (roommate, co-owner, or both).");
      }

      // Insert or update profile data in the appropriate table
      const { error } = await supabase
        .from(tableName)
        .upsert(dbData);

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });

      // Refresh the profile data from the appropriate table
      const { data } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        // Map database field names to ProfileFormValues properties
        const formattedData: Partial<ProfileFormValues> = {
          fullName: data.full_name || "",
          age: data.age || "",
          gender: data.gender || "",
          phoneNumber: data.phone_number || "",
          email: data.email || "",
          linkedinProfile: data.linkedin_profile || "",
          preferredLocation: data.preferred_location || "",
          budgetRange: data.budget_range || [800, 1500],
          moveInDate: data.move_in_date ? new Date(data.move_in_date) : new Date(),
          housingType: (data.housing_type as "house" | "apartment") || "apartment",
          livingSpace: (data.living_space as "privateRoom" | "sharedRoom" | "entirePlace") || "privateRoom",
          smoking: !!data.smoking,
          livesWithSmokers: !!data.lives_with_smokers,
          hasPets: !!data.has_pets,
          petPreference: (data.pet_preference as "noPets" | "onlyCats" | "onlyDogs" | "both") || "noPets",
          workLocation: (data.work_location as "remote" | "office" | "hybrid") || "office",
          dailyRoutine: (data.daily_routine as "morning" | "night" | "mixed") || "morning",
          hobbies: data.hobbies || [],
          workSchedule: data.work_schedule || "",
          sleepSchedule: data.sleep_schedule || "",
          overnightGuests: (data.overnight_guests as "yes" | "no" | "occasionally") || "occasionally",
          cleanliness: (data.cleanliness as "veryTidy" | "somewhatTidy" | "doesntMindMess") || "somewhatTidy",
          cleaningFrequency: (data.cleaning_frequency as "daily" | "weekly" | "biweekly" | "monthly" | "asNeeded") || "weekly",
          socialLevel: (data.social_level as "extrovert" | "introvert" | "balanced") || "balanced",
          guestsOver: (data.guests_over as "yes" | "no" | "occasionally") || "occasionally",
          familyOver: (data.family_over as "yes" | "no" | "occasionally") || "occasionally",
          atmosphere: (data.atmosphere as "quiet" | "lively" | "balanced") || "balanced",
          hostingFriends: (data.hosting_friends as "yes" | "no" | "occasionally") || "occasionally",
          diet: (data.diet as "vegetarian" | "vegan" | "omnivore" | "other") || "omnivore",
          cookingSharing: (data.cooking_sharing as "share" | "separate") || "share",
          stayDuration: (data.stay_duration as "threeMonths" | "sixMonths" | "oneYear" | "flexible") || "oneYear",
          leaseTerm: (data.lease_term as "shortTerm" | "longTerm") || "longTerm",
          roommateGenderPreference: (data.roommate_gender_preference as "sameGender" | "femaleOnly" | "maleOnly" | "noPreference") || "noPreference",
          roommateAgePreference: (data.roommate_age_preference as "similar" | "younger" | "older" | "noAgePreference") || "similar",
          roommateLifestylePreference: (data.roommate_lifestyle_preference as "similar" | "moreActive" | "quieter" | "noLifestylePreference") || "similar",
          importantRoommateTraits: data.important_roommate_traits || [],
        };
        
        setProfileData(formattedData);
      }
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">My Profile</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : userPreference ? (
            <ProfileForm initialData={profileData} onSave={handleSaveProfile} />
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">Please select your preference (roommate, co-owner, or both) before filling out your profile.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-4 py-2 bg-roomie-purple text-white rounded-md hover:bg-roomie-purple/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
