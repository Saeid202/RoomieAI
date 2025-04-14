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
        // If profile data exists in JSONB field, use it
        if (data.profile_data) {
          setProfileData(data.profile_data);
        } else {
          // Otherwise use defaults
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
        profile_data: formData,
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
