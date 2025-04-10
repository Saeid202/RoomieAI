
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

// Define the types for our database tables
type RoommateTableRow = {
  id: string;
  full_name: string | null;
  age: string | null;
  gender: string | null;
  phone_number: string | null;
  email: string | null;
  linkedin_profile: string | null;
  preferred_location: string | null;
  budget_range: number[] | null;
  move_in_date: string | null;
  housing_type: string | null;
  living_space: string | null;
  smoking: boolean | null;
  lives_with_smokers: boolean | null;
  has_pets: boolean | null;
  pet_preference: string | null;
  work_location: string | null;
  daily_routine: string | null;
  hobbies: string[] | null;
  work_schedule: string | null;
  sleep_schedule: string | null;
  overnight_guests: string | null;
  cleanliness: string | null;
  cleaning_frequency: string | null;
  social_level: string | null;
  guests_over: string | null;
  family_over: string | null;
  atmosphere: string | null;
  hosting_friends: string | null;
  diet: string | null;
  cooking_sharing: string | null;
  stay_duration: string | null;
  lease_term: string | null;
  roommate_gender_preference: string | null;
  roommate_age_preference: string | null;
  roommate_lifestyle_preference: string | null;
  important_roommate_traits: string[] | null;
  created_at: string | null;
  updated_at: string | null;
};

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

        // Use type assertion to help TypeScript understand this is a valid table name
        const { data, error } = await supabase
          .from(tableName as any)
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
          // Handle data based on preference/table
          if (savedPreference === 'both' || savedPreference === 'co-owner') {
            // If we're dealing with tables that might not have all the fields
            // we create default values and only override them if they exist
            const formattedData: Partial<ProfileFormValues> = {
              fullName: "",
              age: "",
              gender: "",
              phoneNumber: "",
              email: "",
              linkedinProfile: "",
              preferredLocation: "",
              budgetRange: [800, 1500],
              moveInDate: new Date(),
              housingType: "apartment",
              livingSpace: "privateRoom",
              smoking: false,
              livesWithSmokers: false,
              hasPets: false,
              petPreference: "noPets",
              workLocation: "office",
              dailyRoutine: "morning",
              hobbies: [],
              workSchedule: "",
              sleepSchedule: "",
              overnightGuests: "occasionally",
              cleanliness: "somewhatTidy",
              cleaningFrequency: "weekly",
              socialLevel: "balanced",
              guestsOver: "occasionally",
              familyOver: "occasionally",
              atmosphere: "balanced",
              hostingFriends: "occasionally",
              diet: "omnivore",
              cookingSharing: "share",
              stayDuration: "oneYear",
              leaseTerm: "longTerm",
              roommateGenderPreference: "noPreference",
              roommateAgePreference: "similar",
              roommateLifestylePreference: "similar",
              importantRoommateTraits: [],
            };
            
            // Now we only override with values that actually exist in the data
            if ('full_name' in data) formattedData.fullName = data.full_name || "";
            if ('age' in data) formattedData.age = data.age || "";
            if ('gender' in data) formattedData.gender = data.gender || "";
            if ('phone_number' in data) formattedData.phoneNumber = data.phone_number || "";
            if ('email' in data) formattedData.email = data.email || "";
            if ('linkedin_profile' in data) formattedData.linkedinProfile = data.linkedin_profile || "";
            if ('preferred_location' in data) formattedData.preferredLocation = data.preferred_location || "";
            if ('budget_range' in data && data.budget_range) formattedData.budgetRange = data.budget_range;
            if ('move_in_date' in data && data.move_in_date) formattedData.moveInDate = new Date(data.move_in_date);
            if ('housing_type' in data && data.housing_type) formattedData.housingType = data.housing_type as "house" | "apartment";
            if ('living_space' in data && data.living_space) formattedData.livingSpace = data.living_space as "privateRoom" | "sharedRoom" | "entirePlace";
            if ('smoking' in data) formattedData.smoking = !!data.smoking;
            if ('lives_with_smokers' in data) formattedData.livesWithSmokers = !!data.lives_with_smokers;
            if ('has_pets' in data) formattedData.hasPets = !!data.has_pets;
            if ('pet_preference' in data && data.pet_preference) formattedData.petPreference = data.pet_preference as "noPets" | "onlyCats" | "onlyDogs" | "both";
            if ('work_location' in data && data.work_location) formattedData.workLocation = data.work_location as "remote" | "office" | "hybrid";
            if ('daily_routine' in data && data.daily_routine) formattedData.dailyRoutine = data.daily_routine as "morning" | "night" | "mixed";
            if ('hobbies' in data && data.hobbies) formattedData.hobbies = data.hobbies;
            if ('work_schedule' in data) formattedData.workSchedule = data.work_schedule || "";
            if ('sleep_schedule' in data) formattedData.sleepSchedule = data.sleep_schedule || "";
            if ('overnight_guests' in data && data.overnight_guests) formattedData.overnightGuests = data.overnight_guests as "yes" | "no" | "occasionally";
            if ('cleanliness' in data && data.cleanliness) formattedData.cleanliness = data.cleanliness as "veryTidy" | "somewhatTidy" | "doesntMindMess";
            if ('cleaning_frequency' in data && data.cleaning_frequency) formattedData.cleaningFrequency = data.cleaning_frequency as "daily" | "weekly" | "biweekly" | "monthly" | "asNeeded";
            if ('social_level' in data && data.social_level) formattedData.socialLevel = data.social_level as "extrovert" | "introvert" | "balanced";
            if ('guests_over' in data && data.guests_over) formattedData.guestsOver = data.guests_over as "yes" | "no" | "occasionally";
            if ('family_over' in data && data.family_over) formattedData.familyOver = data.family_over as "yes" | "no" | "occasionally";
            if ('atmosphere' in data && data.atmosphere) formattedData.atmosphere = data.atmosphere as "quiet" | "lively" | "balanced";
            if ('hosting_friends' in data && data.hosting_friends) formattedData.hostingFriends = data.hosting_friends as "yes" | "no" | "occasionally";
            if ('diet' in data && data.diet) formattedData.diet = data.diet as "vegetarian" | "vegan" | "omnivore" | "other";
            if ('cooking_sharing' in data && data.cooking_sharing) formattedData.cookingSharing = data.cooking_sharing as "share" | "separate";
            if ('stay_duration' in data && data.stay_duration) formattedData.stayDuration = data.stay_duration as "threeMonths" | "sixMonths" | "oneYear" | "flexible";
            if ('lease_term' in data && data.lease_term) formattedData.leaseTerm = data.lease_term as "shortTerm" | "longTerm";
            if ('roommate_gender_preference' in data && data.roommate_gender_preference) formattedData.roommateGenderPreference = data.roommate_gender_preference as "sameGender" | "femaleOnly" | "maleOnly" | "noPreference";
            if ('roommate_age_preference' in data && data.roommate_age_preference) formattedData.roommateAgePreference = data.roommate_age_preference as "similar" | "younger" | "older" | "noAgePreference";
            if ('roommate_lifestyle_preference' in data && data.roommate_lifestyle_preference) formattedData.roommateLifestylePreference = data.roommate_lifestyle_preference as "similar" | "moreActive" | "quieter" | "noLifestylePreference";
            if ('important_roommate_traits' in data && data.important_roommate_traits) formattedData.importantRoommateTraits = data.important_roommate_traits;
            
            setProfileData(formattedData);
          } else if (savedPreference === 'roommate') {
            // For roommate tables, which should have all the expected fields
            const roommateData = data as RoommateTableRow;
            const formattedData: Partial<ProfileFormValues> = {
              fullName: roommateData.full_name || "",
              age: roommateData.age || "",
              gender: roommateData.gender || "",
              phoneNumber: roommateData.phone_number || "",
              email: roommateData.email || "",
              linkedinProfile: roommateData.linkedin_profile || "",
              preferredLocation: roommateData.preferred_location || "",
              budgetRange: roommateData.budget_range || [800, 1500],
              moveInDate: roommateData.move_in_date ? new Date(roommateData.move_in_date) : new Date(),
              housingType: (roommateData.housing_type as "house" | "apartment") || "apartment",
              livingSpace: (roommateData.living_space as "privateRoom" | "sharedRoom" | "entirePlace") || "privateRoom",
              smoking: !!roommateData.smoking,
              livesWithSmokers: !!roommateData.lives_with_smokers,
              hasPets: !!roommateData.has_pets,
              petPreference: (roommateData.pet_preference as "noPets" | "onlyCats" | "onlyDogs" | "both") || "noPets",
              workLocation: (roommateData.work_location as "remote" | "office" | "hybrid") || "office",
              dailyRoutine: (roommateData.daily_routine as "morning" | "night" | "mixed") || "morning",
              hobbies: roommateData.hobbies || [],
              workSchedule: roommateData.work_schedule || "",
              sleepSchedule: roommateData.sleep_schedule || "",
              overnightGuests: (roommateData.overnight_guests as "yes" | "no" | "occasionally") || "occasionally",
              cleanliness: (roommateData.cleanliness as "veryTidy" | "somewhatTidy" | "doesntMindMess") || "somewhatTidy",
              cleaningFrequency: (roommateData.cleaning_frequency as "daily" | "weekly" | "biweekly" | "monthly" | "asNeeded") || "weekly",
              socialLevel: (roommateData.social_level as "extrovert" | "introvert" | "balanced") || "balanced",
              guestsOver: (roommateData.guests_over as "yes" | "no" | "occasionally") || "occasionally",
              familyOver: (roommateData.family_over as "yes" | "no" | "occasionally") || "occasionally",
              atmosphere: (roommateData.atmosphere as "quiet" | "lively" | "balanced") || "balanced",
              hostingFriends: (roommateData.hosting_friends as "yes" | "no" | "occasionally") || "occasionally",
              diet: (roommateData.diet as "vegetarian" | "vegan" | "omnivore" | "other") || "omnivore",
              cookingSharing: (roommateData.cooking_sharing as "share" | "separate") || "share",
              stayDuration: (roommateData.stay_duration as "threeMonths" | "sixMonths" | "oneYear" | "flexible") || "oneYear",
              leaseTerm: (roommateData.lease_term as "shortTerm" | "longTerm") || "longTerm",
              roommateGenderPreference: (roommateData.roommate_gender_preference as "sameGender" | "femaleOnly" | "maleOnly" | "noPreference") || "noPreference",
              roommateAgePreference: (roommateData.roommate_age_preference as "similar" | "younger" | "older" | "noAgePreference") || "similar",
              roommateLifestylePreference: (roommateData.roommate_lifestyle_preference as "similar" | "moreActive" | "quieter" | "noLifestylePreference") || "similar",
              importantRoommateTraits: roommateData.important_roommate_traits || [],
            };
            
            setProfileData(formattedData);
          }
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

      // Insert or update profile data in the appropriate table using type assertion for the table name
      const { error } = await supabase
        .from(tableName as any)
        .upsert(dbData);

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });

      // Refresh the profile data from the appropriate table
      const { data } = await supabase
        .from(tableName as any)
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        // Create a default formatted data object with default values
        const formattedData: Partial<ProfileFormValues> = {
          fullName: "",
          age: "",
          gender: "",
          phoneNumber: "",
          email: "",
          linkedinProfile: "",
          preferredLocation: "",
          budgetRange: [800, 1500],
          moveInDate: new Date(),
          housingType: "apartment",
          livingSpace: "privateRoom",
          smoking: false,
          livesWithSmokers: false,
          hasPets: false,
          petPreference: "noPets",
          workLocation: "office",
          dailyRoutine: "morning",
          hobbies: [],
          workSchedule: "",
          sleepSchedule: "",
          overnightGuests: "occasionally",
          cleanliness: "somewhatTidy",
          cleaningFrequency: "weekly",
          socialLevel: "balanced",
          guestsOver: "occasionally",
          familyOver: "occasionally",
          atmosphere: "balanced",
          hostingFriends: "occasionally",
          diet: "omnivore",
          cookingSharing: "share",
          stayDuration: "oneYear",
          leaseTerm: "longTerm",
          roommateGenderPreference: "noPreference",
          roommateAgePreference: "similar",
          roommateLifestylePreference: "similar",
          importantRoommateTraits: [],
        };
        
        // Now override with values that exist in the data
        if ('full_name' in data) formattedData.fullName = data.full_name || "";
        if ('age' in data) formattedData.age = data.age || "";
        if ('gender' in data) formattedData.gender = data.gender || "";
        if ('phone_number' in data) formattedData.phoneNumber = data.phone_number || "";
        if ('email' in data) formattedData.email = data.email || "";
        if ('linkedin_profile' in data) formattedData.linkedinProfile = data.linkedin_profile || "";
        if ('preferred_location' in data) formattedData.preferredLocation = data.preferred_location || "";
        if ('budget_range' in data && data.budget_range) formattedData.budgetRange = data.budget_range;
        if ('move_in_date' in data && data.move_in_date) formattedData.moveInDate = new Date(data.move_in_date);
        if ('housing_type' in data && data.housing_type) formattedData.housingType = data.housing_type as "house" | "apartment";
        if ('living_space' in data && data.living_space) formattedData.livingSpace = data.living_space as "privateRoom" | "sharedRoom" | "entirePlace";
        if ('smoking' in data) formattedData.smoking = !!data.smoking;
        if ('lives_with_smokers' in data) formattedData.livesWithSmokers = !!data.lives_with_smokers;
        if ('has_pets' in data) formattedData.hasPets = !!data.has_pets;
        if ('pet_preference' in data && data.pet_preference) formattedData.petPreference = data.pet_preference as "noPets" | "onlyCats" | "onlyDogs" | "both";
        if ('work_location' in data && data.work_location) formattedData.workLocation = data.work_location as "remote" | "office" | "hybrid";
        if ('daily_routine' in data && data.daily_routine) formattedData.dailyRoutine = data.daily_routine as "morning" | "night" | "mixed";
        if ('hobbies' in data && data.hobbies) formattedData.hobbies = data.hobbies;
        if ('work_schedule' in data) formattedData.workSchedule = data.work_schedule || "";
        if ('sleep_schedule' in data) formattedData.sleepSchedule = data.sleep_schedule || "";
        if ('overnight_guests' in data && data.overnight_guests) formattedData.overnightGuests = data.overnight_guests as "yes" | "no" | "occasionally";
        if ('cleanliness' in data && data.cleanliness) formattedData.cleanliness = data.cleanliness as "veryTidy" | "somewhatTidy" | "doesntMindMess";
        if ('cleaning_frequency' in data && data.cleaning_frequency) formattedData.cleaningFrequency = data.cleaning_frequency as "daily" | "weekly" | "biweekly" | "monthly" | "asNeeded";
        if ('social_level' in data && data.social_level) formattedData.socialLevel = data.social_level as "extrovert" | "introvert" | "balanced";
        if ('guests_over' in data && data.guests_over) formattedData.guestsOver = data.guests_over as "yes" | "no" | "occasionally";
        if ('family_over' in data && data.family_over) formattedData.familyOver = data.family_over as "yes" | "no" | "occasionally";
        if ('atmosphere' in data && data.atmosphere) formattedData.atmosphere = data.atmosphere as "quiet" | "lively" | "balanced";
        if ('hosting_friends' in data && data.hosting_friends) formattedData.hostingFriends = data.hosting_friends as "yes" | "no" | "occasionally";
        if ('diet' in data && data.diet) formattedData.diet = data.diet as "vegetarian" | "vegan" | "omnivore" | "other";
        if ('cooking_sharing' in data && data.cooking_sharing) formattedData.cookingSharing = data.cooking_sharing as "share" | "separate";
        if ('stay_duration' in data && data.stay_duration) formattedData.stayDuration = data.stay_duration as "threeMonths" | "sixMonths" | "oneYear" | "flexible";
        if ('lease_term' in data && data.lease_term) formattedData.leaseTerm = data.lease_term as "shortTerm" | "longTerm";
        if ('roommate_gender_preference' in data && data.roommate_gender_preference) formattedData.roommateGenderPreference = data.roommate_gender_preference as "sameGender" | "femaleOnly" | "maleOnly" | "noPreference";
        if ('roommate_age_preference' in data && data.roommate_age_preference) formattedData.roommateAgePreference = data.roommate_age_preference as "similar" | "younger" | "older" | "noAgePreference";
        if ('roommate_lifestyle_preference' in data && data.roommate_lifestyle_preference) formattedData.roommateLifestylePreference = data.roommate_lifestyle_preference as "similar" | "moreActive" | "quieter" | "noLifestylePreference";
        if ('important_roommate_traits' in data && data.important_roommate_traits) formattedData.importantRoommateTraits = data.important_roommate_traits;
        
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
