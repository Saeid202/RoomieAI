
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { findMatches as findMatchesAlgorithm } from "@/utils/matchingAlgorithm";

export function useMatching() {
  const { toast } = useToast();
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
      setIsFindingMatches(true);
      console.log("Finding matches with profile data in useMatching:", profileData);
      
      if (!profileData) {
        console.error("Profile data is null, cannot find matches");
        toast({
          title: "Profile incomplete",
          description: "Please complete your profile before finding matches",
          variant: "destructive",
        });
        return;
      }
      
      // Validate essential fields
      if (!profileData.fullName || !profileData.age) {
        console.warn("Profile missing essential fields");
        toast({
          title: "Profile incomplete",
          description: "Please fill in at least your name and age before finding matches",
          variant: "destructive",
        });
        return;
      }
      
      // Use the algorithm directly on the form values
      const matchesFound = findMatchesAlgorithm(profileData);
      console.log("Matches found:", matchesFound.length, matchesFound);
      
      // Update state with found matches
      setRoommates(matchesFound || []);
    } catch (error) {
      console.error("Error finding matches:", error);
      toast({
        title: "Error",
        description: "Failed to find matches. Please try again.",
        variant: "destructive",
      });
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
