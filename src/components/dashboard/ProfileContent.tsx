
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
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PersonalDetailsForm } from "@/components/dashboard/co-owner/PersonalDetailsForm";

// Define the types for our database tables with user_id for RLS
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
  user_id: string | null;
};

// Define common type for all tables to avoid redundancy
type ProfileTableRow = {
  id?: string;
  user_id?: string | null;
  full_name?: string | null;
  age?: string | null;
  gender?: string | null;
  phone_number?: string | null;
  email?: string | null;
  linkedin_profile?: string | null;
  preferred_location?: string | null;
  budget_range?: number[] | null;
  move_in_date?: string | null;
  housing_type?: string | null;
  living_space?: string | null;
  smoking?: boolean | null;
  lives_with_smokers?: boolean | null;
  has_pets?: boolean | null;
  pet_preference?: string | null;
  work_location?: string | null;
  daily_routine?: string | null;
  hobbies?: string[] | null;
  work_schedule?: string | null;
  sleep_schedule?: string | null;
  overnight_guests?: string | null;
  cleanliness?: string | null;
  cleaning_frequency?: string | null;
  social_level?: string | null;
  guests_over?: string | null;
  family_over?: string | null;
  atmosphere?: string | null;
  hosting_friends?: string | null;
  diet?: string | null;
  cooking_sharing?: string | null;
  stay_duration?: string | null;
  lease_term?: string | null;
  roommate_gender_preference?: string | null;
  roommate_age_preference?: string | null;
  roommate_lifestyle_preference?: string | null;
  important_roommate_traits?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any; // Allow dynamic properties
};

// Use these type aliases for better readability
type CoOwnerTableRow = ProfileTableRow;
type BothTableRow = ProfileTableRow;

// Define a type for the table names accepted by Supabase
type TableName = "roommate" | "co-owner" | "Both";

export function ProfileContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPreference, setUserPreference] = useState<UserPreference>(null);
  const [activeTab, setActiveTab] = useState("personal-details");

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
        let tableName: TableName;
        if (savedPreference === 'roommate') {
          tableName = 'roommate';
        } else if (savedPreference === 'co-owner') {
          tableName = 'co-owner';
        } else if (savedPreference === 'both') {
          tableName = 'Both'; // Note the capital 'B' in "Both" table name
        } else {
          setLoading(false);
          return;
        }

        console.log("Fetching from table:", tableName);
        console.log("User ID:", user.id);

        // Query by user_id field for user-specific data
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // Check if it's a PostgrestError with a code property
          const postgrestError = error as PostgrestError;
          // PGRST116 is "Not found" error, which is expected for new users
          if (postgrestError.code !== 'PGRST116') {
            console.error("Error fetching profile data:", error);
            throw error;
          }
        }

        if (data) {
          console.log("Fetched data:", data);
          
          // Create default formattedData with safe defaults
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
          
          // Safely assign values from database with proper type checking
          if ('full_name' in data && data.full_name) formattedData.fullName = String(data.full_name);
          if ('age' in data && data.age) formattedData.age = String(data.age);
          if ('gender' in data && data.gender) formattedData.gender = String(data.gender);
          if ('phone_number' in data && data.phone_number) formattedData.phoneNumber = String(data.phone_number);
          if ('email' in data && data.email) formattedData.email = String(data.email);
          if ('linkedin_profile' in data && data.linkedin_profile) formattedData.linkedinProfile = String(data.linkedin_profile);
          if ('preferred_location' in data && data.preferred_location) formattedData.preferredLocation = String(data.preferred_location);
          
          // Handle arrays and special types properly
          if ('budget_range' in data && data.budget_range && Array.isArray(data.budget_range)) {
            formattedData.budgetRange = data.budget_range.map(Number);
          }
          
          if ('move_in_date' in data && data.move_in_date) {
            formattedData.moveInDate = new Date(String(data.move_in_date));
          }
          
          // Safely handle enum values with type checking
          if ('housing_type' in data && data.housing_type) {
            const housingType = String(data.housing_type);
            if (housingType === "house" || housingType === "apartment") {
              formattedData.housingType = housingType;
            }
          }
          
          if ('living_space' in data && data.living_space) {
            const livingSpace = String(data.living_space);
            if (livingSpace === "privateRoom" || livingSpace === "sharedRoom" || livingSpace === "entirePlace") {
              formattedData.livingSpace = livingSpace;
            }
          }
          
          // Boolean values
          if ('smoking' in data) formattedData.smoking = !!data.smoking;
          if ('lives_with_smokers' in data) formattedData.livesWithSmokers = !!data.lives_with_smokers;
          if ('has_pets' in data) formattedData.hasPets = !!data.has_pets;
          
          // More enum values with proper type checking
          if ('pet_preference' in data && data.pet_preference) {
            const petPref = String(data.pet_preference);
            if (["noPets", "onlyCats", "onlyDogs", "both"].includes(petPref)) {
              formattedData.petPreference = petPref as "noPets" | "onlyCats" | "onlyDogs" | "both";
            }
          }
          
          if ('work_location' in data && data.work_location) {
            const workLoc = String(data.work_location);
            if (["remote", "office", "hybrid"].includes(workLoc)) {
              formattedData.workLocation = workLoc as "remote" | "office" | "hybrid";
            }
          }
          
          if ('daily_routine' in data && data.daily_routine) {
            const routine = String(data.daily_routine);
            if (["morning", "night", "mixed"].includes(routine)) {
              formattedData.dailyRoutine = routine as "morning" | "night" | "mixed";
            }
          }
          
          // Handle arrays safely
          if ('hobbies' in data && data.hobbies && Array.isArray(data.hobbies)) {
            formattedData.hobbies = data.hobbies.map(String);
          }
          
          // Handle simple string values
          if ('work_schedule' in data && data.work_schedule) formattedData.workSchedule = String(data.work_schedule);
          if ('sleep_schedule' in data && data.sleep_schedule) formattedData.sleepSchedule = String(data.sleep_schedule);
          
          // More enum handling
          if ('overnight_guests' in data && data.overnight_guests) {
            const guests = String(data.overnight_guests);
            if (["yes", "no", "occasionally"].includes(guests)) {
              formattedData.overnightGuests = guests as "yes" | "no" | "occasionally";
            }
          }
          
          if ('cleanliness' in data && data.cleanliness) {
            const clean = String(data.cleanliness);
            if (["veryTidy", "somewhatTidy", "doesntMindMess"].includes(clean)) {
              formattedData.cleanliness = clean as "veryTidy" | "somewhatTidy" | "doesntMindMess";
            }
          }
          
          if ('cleaning_frequency' in data && data.cleaning_frequency) {
            const freq = String(data.cleaning_frequency);
            if (["daily", "weekly", "biweekly", "monthly", "asNeeded"].includes(freq)) {
              formattedData.cleaningFrequency = freq as "daily" | "weekly" | "biweekly" | "monthly" | "asNeeded";
            }
          }
          
          if ('social_level' in data && data.social_level) {
            const social = String(data.social_level);
            if (["extrovert", "introvert", "balanced"].includes(social)) {
              formattedData.socialLevel = social as "extrovert" | "introvert" | "balanced";
            }
          }
          
          if ('guests_over' in data && data.guests_over) {
            const guests = String(data.guests_over);
            if (["yes", "no", "occasionally"].includes(guests)) {
              formattedData.guestsOver = guests as "yes" | "no" | "occasionally";
            }
          }
          
          if ('family_over' in data && data.family_over) {
            const family = String(data.family_over);
            if (["yes", "no", "occasionally"].includes(family)) {
              formattedData.familyOver = family as "yes" | "no" | "occasionally";
            }
          }
          
          if ('atmosphere' in data && data.atmosphere) {
            const atmos = String(data.atmosphere);
            if (["quiet", "lively", "balanced"].includes(atmos)) {
              formattedData.atmosphere = atmos as "quiet" | "lively" | "balanced";
            }
          }
          
          if ('hosting_friends' in data && data.hosting_friends) {
            const hosting = String(data.hosting_friends);
            if (["yes", "no", "occasionally"].includes(hosting)) {
              formattedData.hostingFriends = hosting as "yes" | "no" | "occasionally";
            }
          }
          
          if ('diet' in data && data.diet) {
            const diet = String(data.diet);
            if (["vegetarian", "vegan", "omnivore", "other"].includes(diet)) {
              formattedData.diet = diet as "vegetarian" | "vegan" | "omnivore" | "other";
            }
          }
          
          if ('cooking_sharing' in data && data.cooking_sharing) {
            const cooking = String(data.cooking_sharing);
            if (["share", "separate"].includes(cooking)) {
              formattedData.cookingSharing = cooking as "share" | "separate";
            }
          }
          
          if ('stay_duration' in data && data.stay_duration) {
            const duration = String(data.stay_duration);
            if (["threeMonths", "sixMonths", "oneYear", "flexible"].includes(duration)) {
              formattedData.stayDuration = duration as "threeMonths" | "sixMonths" | "oneYear" | "flexible";
            }
          }
          
          if ('lease_term' in data && data.lease_term) {
            const lease = String(data.lease_term);
            if (["shortTerm", "longTerm"].includes(lease)) {
              formattedData.leaseTerm = lease as "shortTerm" | "longTerm";
            }
          }
          
          if ('roommate_gender_preference' in data && data.roommate_gender_preference) {
            const gender = String(data.roommate_gender_preference);
            if (["sameGender", "femaleOnly", "maleOnly", "noPreference"].includes(gender)) {
              formattedData.roommateGenderPreference = gender as "sameGender" | "femaleOnly" | "maleOnly" | "noPreference";
            }
          }
          
          if ('roommate_age_preference' in data && data.roommate_age_preference) {
            const age = String(data.roommate_age_preference);
            if (["similar", "younger", "older", "noAgePreference"].includes(age)) {
              formattedData.roommateAgePreference = age as "similar" | "younger" | "older" | "noAgePreference";
            }
          }
          
          if ('roommate_lifestyle_preference' in data && data.roommate_lifestyle_preference) {
            const lifestyle = String(data.roommate_lifestyle_preference);
            if (["similar", "moreActive", "quieter", "noLifestylePreference"].includes(lifestyle)) {
              formattedData.roommateLifestylePreference = lifestyle as "similar" | "moreActive" | "quieter" | "noLifestylePreference";
            }
          }
          
          if ('important_roommate_traits' in data && data.important_roommate_traits && Array.isArray(data.important_roommate_traits)) {
            formattedData.importantRoommateTraits = data.important_roommate_traits.map(String);
          }
          
          setProfileData(formattedData);
        }
      } catch (error: any) {
        console.error("Profile loading error:", error);
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
      
      console.log("Saving profile for user:", user.id);
      console.log("Selected preference:", userPreference);
      console.log("Form data to save:", formData);
      
      // Prepare data for Supabase - convert camelCase to snake_case for DB columns
      const dbData = {
        // Set user_id to the authenticated user's ID
        user_id: user.id,
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
      let tableName: TableName; 
      if (userPreference === 'roommate') {
        tableName = 'roommate';
      } else if (userPreference === 'co-owner') {
        tableName = 'co-owner';
      } else if (userPreference === 'both') {
        tableName = 'Both'; // Note the capital 'B' in "Both" table name
      } else {
        throw new Error("No table selected. Please select a preference (roommate, co-owner, or both).");
      }

      console.log("Saving to table:", tableName);

      // First check if a record already exists with the user_id
      const { data: existingData, error: fetchError } = await supabase
        .from(tableName)
        .select('id, user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error checking existing profile:", fetchError);
        throw fetchError;
      }
      
      let result;
      if (existingData) {
        // Update existing record
        console.log("Updating existing record:", existingData);
        result = await supabase
          .from(tableName)
          .update(dbData)
          .eq('user_id', user.id);
      } else {
        // Insert new record
        console.log("Inserting new record");
        result = await supabase
          .from(tableName)
          .insert(dbData);
      }
      
      if (result.error) {
        console.error("Error saving profile:", result.error);
        throw result.error;
      }

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });

      // Refresh the page to show updated data
      window.location.reload();
      
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Render different content based on the user preference
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }

    if (!userPreference) {
      return (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Please select your preference (roommate, co-owner, or both) before filling out your profile.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-roomie-purple text-white rounded-md hover:bg-roomie-purple/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    // For co-owner preference, show the tabbed interface
    if (userPreference === 'co-owner' || userPreference === 'both') {
      return (
        <div className="space-y-8">
          {userPreference === 'both' && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Roommate Profile</h2>
              <ProfileForm initialData={profileData} onSave={handleSaveProfile} />
            </div>
          )}
          
          <div>
            {userPreference === 'both' && (
              <h2 className="text-xl font-bold mb-4">Co-Owner Profile</h2>
            )}
            
            <Card className="p-6">
              <Tabs
                defaultValue="personal-details"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="overflow-x-auto pb-2">
                  <TabsList className="w-full bg-muted inline-flex h-auto p-1 gap-2 flex-nowrap">
                    <TabsTrigger 
                      value="personal-details"
                      className="whitespace-nowrap py-2"
                    >
                      Personal Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="residence-citizenship"
                      className="whitespace-nowrap py-2"
                    >
                      Residence & Citizenship
                    </TabsTrigger>
                    <TabsTrigger 
                      value="employment"
                      className="whitespace-nowrap py-2"
                    >
                      Employment
                    </TabsTrigger>
                    <TabsTrigger 
                      value="financial-situation"
                      className="whitespace-nowrap py-2"
                    >
                      Financial Situation
                    </TabsTrigger>
                    <TabsTrigger 
                      value="investment-capacity"
                      className="whitespace-nowrap py-2"
                    >
                      Investment Capacity
                    </TabsTrigger>
                    <TabsTrigger 
                      value="investment-preferences"
                      className="whitespace-nowrap py-2"
                    >
                      Investment Preferences
                    </TabsTrigger>
                    <TabsTrigger 
                      value="risk-management"
                      className="whitespace-nowrap py-2"
                    >
                      Risk Management
                    </TabsTrigger>
                    <TabsTrigger 
                      value="identity-verification"
                      className="whitespace-nowrap py-2"
                    >
                      Identity Verification
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="personal-details" className="mt-6">
                  <PersonalDetailsForm />
                </TabsContent>
                
                <TabsContent value="residence-citizenship" className="mt-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">Residence & Citizenship Form</h3>
                    <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="employment" className="mt-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">Employment Information</h3>
                    <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="financial-situation" className="mt-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">Financial Situation</h3>
                    <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="investment-capacity" className="mt-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">Investment Capacity</h3>
                    <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="investment-preferences" className="mt-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">Investment Preferences</h3>
                    <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="risk-management" className="mt-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">Risk Management</h3>
                    <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="identity-verification" className="mt-6">
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">Identity Verification</h3>
                    <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      );
    }

    // Default for roommate preference
    return <ProfileForm initialData={profileData} onSave={handleSaveProfile} />;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">My Profile</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
