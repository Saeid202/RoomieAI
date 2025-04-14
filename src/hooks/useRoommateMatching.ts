
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { findMatches as findMatchesAlgorithm } from "@/utils/matchingAlgorithm";
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
      
      // Fetch user profile from the "Find My Ideal Roommate" table
      const { data, error } = await supabase
        .from('Find My Ideal Roommate')
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
        profile_data: {
          fullName: formData.fullName,
          age: formData.age,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          linkedinProfile: formData.linkedinProfile,
          preferredLocation: formData.preferredLocation,
          budgetRange: formData.budgetRange,
          moveInDate: formData.moveInDate ? formData.moveInDate.toISOString() : null,
          housingType: formData.housingType,
          livingSpace: formData.livingSpace,
          smoking: formData.smoking,
          livesWithSmokers: formData.livesWithSmokers,
          hasPets: formData.hasPets,
          petPreference: formData.petPreference,
          workLocation: formData.workLocation,
          dailyRoutine: formData.dailyRoutine,
          hobbies: formData.hobbies,
          workSchedule: formData.workSchedule,
          sleepSchedule: formData.sleepSchedule,
          overnightGuests: formData.overnightGuests,
          cleanliness: formData.cleanliness,
          cleaningFrequency: formData.cleaningFrequency,
          socialLevel: formData.socialLevel,
          guestsOver: formData.guestsOver,
          familyOver: formData.familyOver,
          atmosphere: formData.atmosphere,
          hostingFriends: formData.hostingFriends,
          diet: formData.diet,
          cookingSharing: formData.cookingSharing,
          stayDuration: formData.stayDuration,
          leaseTerm: formData.leaseTerm,
          roommateGenderPreference: formData.roommateGenderPreference,
          roommateAgePreference: formData.roommateAgePreference,
          roommateLifestylePreference: formData.roommateLifestylePreference,
          importantRoommateTraits: formData.importantRoommateTraits
        },
        updated_at: new Date().toISOString()
      };
      
      // Check if user already has a profile
      const { data: existingProfile, error: checkError } = await supabase
        .from('Find My Ideal Roommate')
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
          .from('Find My Ideal Roommate')
          .update(dbData)
          .eq('user_id', user.id);
      } else {
        // Insert new profile
        result = await supabase
          .from('Find My Ideal Roommate')
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

  // Helper function to map database row to form values
  const mapDbRowToFormValues = (dbRow: any): Partial<ProfileFormValues> => {
    if (!dbRow.profile_data) {
      return {};
    }
    
    const profileData = dbRow.profile_data;
    const moveInDate = profileData.moveInDate ? new Date(profileData.moveInDate) : new Date();
    
    return {
      fullName: profileData.fullName || "",
      age: profileData.age || "",
      gender: profileData.gender || "",
      phoneNumber: profileData.phoneNumber || "",
      email: profileData.email || "",
      linkedinProfile: profileData.linkedinProfile || "",
      preferredLocation: profileData.preferredLocation || "",
      budgetRange: profileData.budgetRange || [800, 1500],
      moveInDate: moveInDate,
      housingType: profileData.housingType || "apartment",
      livingSpace: profileData.livingSpace || "privateRoom",
      smoking: profileData.smoking || false,
      livesWithSmokers: profileData.livesWithSmokers || false,
      hasPets: profileData.hasPets || false,
      petPreference: profileData.petPreference || "noPets",
      workLocation: profileData.workLocation || "office",
      dailyRoutine: profileData.dailyRoutine || "morning",
      hobbies: profileData.hobbies || [],
      workSchedule: profileData.workSchedule || "",
      sleepSchedule: profileData.sleepSchedule || "",
      overnightGuests: profileData.overnightGuests || "occasionally",
      cleanliness: profileData.cleanliness || "somewhatTidy",
      cleaningFrequency: profileData.cleaningFrequency || "weekly",
      socialLevel: profileData.socialLevel || "balanced",
      guestsOver: profileData.guestsOver || "occasionally",
      familyOver: profileData.familyOver || "occasionally",
      atmosphere: profileData.atmosphere || "balanced",
      hostingFriends: profileData.hostingFriends || "occasionally",
      diet: profileData.diet || "omnivore",
      cookingSharing: profileData.cookingSharing || "share",
      stayDuration: profileData.stayDuration || "oneYear",
      leaseTerm: profileData.leaseTerm || "longTerm",
      roommateGenderPreference: profileData.roommateGenderPreference || "noPreference",
      roommateAgePreference: profileData.roommateAgePreference || "similar",
      roommateLifestylePreference: profileData.roommateLifestylePreference || "similar",
      importantRoommateTraits: profileData.importantRoommateTraits || [],
    };
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
