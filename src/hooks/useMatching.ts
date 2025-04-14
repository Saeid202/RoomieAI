
import { useState } from "react";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { ProfileFormValues } from "@/types/profile";
import { findMatches as findMatchesAlgorithm } from "@/utils/matchingAlgorithm";

export function useMatching() {
  const { showSuccess, showError } = useToastNotifications();
  const [roommates, setRoommates] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("roommates");
  const [isFindingMatches, setIsFindingMatches] = useState(false);

  const handleViewDetails = (match) => {
    // Scroll to top when viewing details to prevent footer jumps
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedMatch(match);
  };

  const handleCloseDetails = () => {
    setSelectedMatch(null);
  };

  const findMatches = async (profileData: ProfileFormValues): Promise<void> => {
    try {
      console.log("findMatches called in useMatching with profileData:", 
        profileData ? { 
          fullName: profileData.fullName, 
          age: profileData.age 
        } : 'null profileData');
      
      setIsFindingMatches(true);
      
      if (!profileData) {
        console.error("Profile data is null, cannot find matches");
        showError("Profile incomplete", "Please complete your profile before finding matches");
        setIsFindingMatches(false);
        return;
      }
      
      // Validate essential fields
      if (!profileData.fullName || !profileData.age) {
        console.warn("Profile missing essential fields", { 
          fullName: profileData.fullName, 
          age: profileData.age 
        });
        showError(
          "Profile incomplete",
          "Please fill in at least your name and age before finding matches"
        );
        setIsFindingMatches(false);
        return;
      }
      
      console.log("Calling findMatchesAlgorithm with valid profile data");
      
      try {
        // Use the algorithm directly with the validated profile data
        const matchesFound = findMatchesAlgorithm(profileData);
        
        console.log("Matches found:", matchesFound?.length || 0);
        
        // Update state with found matches
        setRoommates(matchesFound || []);
        
        // If no matches were found, inform the user
        if (!matchesFound || matchesFound.length === 0) {
          showSuccess(
            "No matches found",
            "Try adjusting your preferences to find more potential matches"
          );
        } else {
          showSuccess(
            "Matches found!",
            `Found ${matchesFound.length} potential roommate matches`
          );
        }
      } catch (matchError) {
        console.error("Error in findMatchesAlgorithm:", matchError);
        showError(
          "Error finding matches",
          "An error occurred while processing your profile. Please try again."
        );
      }
    } catch (error) {
      console.error("Error finding matches in useMatching:", error);
      showError(it
        "Error",
        "Failed to find matches. Please try again."
      );
    } finally {
      setIsFindingMatches(false);
    }
  };

  return {
    roommates,
    properties,
    selectedMatch,
    activeTab,
    isFindingMatches,
    setActiveTab,
    handleViewDetails,
    handleCloseDetails,
    findMatches
  };
}
