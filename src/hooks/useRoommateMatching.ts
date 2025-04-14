
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UserPreference } from "@/components/dashboard/types";
import { ProfileFormValues } from "@/types/profile";
import { fetchProfileData, getTableNameFromPreference, saveProfileData } from "@/services/profileService";
import { findMatches as findMatchesAlgorithm, convertFormToProfileData } from "@/utils/matchingAlgorithm";
import { mapDbRowToFormValues } from "@/utils/profileDataMappers";
import { supabase } from "@/integrations/supabase/client";

export function useRoommateMatching() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);
  const [roommates, setRoommates] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("roommates");

  const handleViewDetails = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseDetails = () => {
    setSelectedMatch(null);
  };

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user profile from the roommate_profiles table
      const { data, error } = await supabase
        .from('roommate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching roommate profile:", error);
        throw error;
      }
      
      if (data) {
        console.log("Fetched roommate profile:", data);
        // Map database row to form values format
        const formattedData = mapDbRowToFormValues(data);
        setProfileData(formattedData);
      } else {
        // If no profile exists yet, use default values
        setProfileData({
          fullName: "",
          age: "",
          gender: "",
          email: user.email || "",
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
          importantRoommateTraits: []
        });
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

  const handleSaveProfile = async (formData: ProfileFormValues) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to save your profile",
          variant: "destructive",
        });
        return false;
      }
      
      console.log("Saving profile data:", formData);
      
      // Prepare data for saving to the database
      const dbData = {
        user_id: user.id,
        full_name: formData.fullName,
        age: formData.age,
        gender: formData.gender,
        phone_number: formData.phoneNumber,
        email: formData.email,
        linkedin_profile: formData.linkedinProfile,
        preferred_location: formData.preferredLocation,
        budget_range: formData.budgetRange,
        move_in_date: formData.moveInDate ? formData.moveInDate.toISOString() : null,
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
        updated_at: new Date().toISOString()
      };
      
      // Check if user already has a profile
      const { data: existingProfile, error: checkError } = await supabase
        .from('roommate_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing profile:", checkError);
        throw checkError;
      }
      
      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('roommate_profiles')
          .update(dbData)
          .eq('user_id', user.id);
      } else {
        // Insert new profile
        result = await supabase
          .from('roommate_profiles')
          .insert(dbData);
      }
      
      if (result.error) {
        console.error("Error saving profile:", result.error);
        throw result.error;
      }
      
      // Update local state with the saved data
      setProfileData(formData);
      
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const findMatches = async () => {
    try {
      console.log("Finding matches with profile data:", profileData);
      
      if (!profileData) {
        toast({
          title: "Profile incomplete",
          description: "Please complete your profile before finding matches",
          variant: "destructive",
        });
        return;
      }
      
      // First convert to ProfileFormValues to ensure the right types
      const formValues = profileData as ProfileFormValues;
      
      // Use the algorithm directly on the form values
      // The algorithm will handle the conversion internally
      const matchesFound = findMatchesAlgorithm(formValues);
      console.log("Matches found:", matchesFound);
      
      // Update state with found matches
      setRoommates(matchesFound);
      
      return matchesFound;
    } catch (error) {
      console.error("Error finding matches:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user, toast]);

  return {
    loading,
    profileData,
    roommates,
    properties,
    selectedMatch,
    activeTab,
    setActiveTab,
    handleViewDetails,
    handleCloseDetails,
    findMatches,
    handleSaveProfile,
    loadProfileData
  };
}
