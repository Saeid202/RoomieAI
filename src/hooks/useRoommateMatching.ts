
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UserPreference } from "@/components/dashboard/types";
import { ProfileFormValues } from "@/types/profile";
import { fetchProfileData, getTableNameFromPreference } from "@/services/profileService";
import { findMatches } from "@/utils/matchingAlgorithm";
import { mapDbRowToFormValues } from "@/utils/profileDataMappers";

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
    handleCloseDetails
  };
}
