
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client"; 
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PostgrestError } from "@supabase/supabase-js";
import { ProfileFormValues } from "@/types/profile";

export function ProfileContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/');
      return;
    }

    // Load profile data from Supabase
    const fetchProfileData = async () => {
      try {
        // Use the correct query to fetch profile data
        const { data, error } = await supabase
          .from('profiles')
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
          // Convert date string to Date object if it exists
          const formattedData = {
            ...data,
            moveInDate: data.move_in_date ? new Date(data.move_in_date) : new Date(),
            budgetRange: data.budget_range || [800, 1500]
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
      if (!user) return;
      
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

      // Insert or update profile data
      const { error } = await supabase
        .from('profiles')
        .upsert(dbData);

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });

      // Refresh the profile data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        // Convert date string to Date object if it exists
        const formattedData = {
          ...data,
          moveInDate: data.move_in_date ? new Date(data.move_in_date) : new Date(),
          budgetRange: data.budget_range || [800, 1500]
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
          ) : (
            <ProfileForm initialData={profileData} onSave={handleSaveProfile} />
          )}
        </div>
      </div>
    </div>
  );
}
