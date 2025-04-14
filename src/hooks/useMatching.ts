
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

  const findMatches = async (profileData: Partial<ProfileFormValues> | null) => {
    try {
      setIsFindingMatches(true);
      console.log("Finding matches with profile data:", profileData);
      
      if (!profileData) {
        toast({
          title: "Profile incomplete",
          description: "Please complete your profile before finding matches",
          variant: "destructive",
        });
        return [];
      }
      
      // First convert to ProfileFormValues to ensure the right types
      const formValues = profileData as ProfileFormValues;
      
      // Use the algorithm directly on the form values
      // The algorithm will handle the conversion internally
      const matchesFound = findMatchesAlgorithm(formValues);
      console.log("Matches found:", matchesFound);
      
      // Update state with found matches
      setRoommates(matchesFound || []);
      
      return matchesFound || [];
    } catch (error) {
      console.error("Error finding matches:", error);
      toast({
        title: "Error",
        description: "Failed to find matches. Please try again.",
        variant: "destructive",
      });
      return [];
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
