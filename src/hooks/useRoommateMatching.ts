
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UserPreference } from "@/components/dashboard/types";
import { ProfileFormValues } from "@/types/profile";
import { fetchProfileData, getTableNameFromPreference, saveProfileData } from "@/services/profileService";
import { findMatches as findMatchesAlgorithm } from "@/utils/matchingAlgorithm";
import { mapDbRowToFormValues } from "@/utils/profileDataMappers";
import { mapFormToProfileData } from "@/utils/matchingAlgorithm/profileMapper";

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

  const handleSaveProfile = async (formData: ProfileFormValues) => {
    try {
      console.log("Saving profile data:", formData);
      
      // In a real application, this would save to the database
      // For this demo, we'll just update the state
      setProfileData(formData);
      
      // If connected to Supabase, we would save to the database
      if (user) {
        const userPreference = localStorage.getItem('userPreference') as UserPreference || 'roommate';
        const tableName = getTableNameFromPreference(userPreference);
        
        if (tableName) {
          await saveProfileData(formData, user.id, tableName);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
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
      
      // Convert profile form data to the format expected by the matching algorithm
      const profileForMatching = mapFormToProfileData(profileData as ProfileFormValues);
      
      // Find matches using the algorithm
      // We need to manually convert the profileForMatching back to the expected type
      // since the algorithm expects a different format for cleanliness
      const matchesFound = findMatchesAlgorithm(profileForMatching);
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
    const loadProfileAndMatches = async () => {
      try {
        setLoading(true);
        
        // Default to roommate preference if not found
        const storedPreference = localStorage.getItem('userPreference') || 'roommate';
        
        // Convert string to UserPreference type
        const userPreference: UserPreference = 
          storedPreference === 'roommate' || storedPreference === 'co-owner' 
            ? storedPreference 
            : 'roommate';
        
        // Create mock profile data for demonstration
        const mockProfileData: Partial<ProfileFormValues> = {
          fullName: "Demo User",
          age: "25-30",
          gender: "prefer-not-to-say",
          email: "demo@example.com",
          phoneNumber: "1234567890",
          budgetRange: [900, 1500],
          preferredLocation: "San Francisco",
          moveInDate: new Date(),
          dailyRoutine: "mixed", // Changed from "balanced" to "mixed" to match expected type
          cleanliness: "somewhatTidy",
          hasPets: false,
          smoking: false,
          guestsOver: "occasionally",
          hobbies: ["reading", "hiking", "movies"],
          importantRoommateTraits: ["respectful", "clean", "friendly"]
        };
        
        setProfileData(mockProfileData);
        
        // Make sure findMatches doesn't crash by providing fallback values
        try {
          if (mockProfileData) {
            // Mock roommates data if real data can't be loaded
            const tempRoommates = [];
            setRoommates(tempRoommates);
          }
        } catch (error) {
          console.error("Error finding matches:", error);
          setRoommates([]);
        }
        
      } catch (error) {
        console.error("Error loading matches:", error);
        toast({
          title: "Error loading data",
          description: "Could not load roommate data. Using demo mode.",
          variant: "destructive",
        });
        setRoommates([]);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileAndMatches();
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
    handleSaveProfile
  };
}
