
import { useState } from "react";
import { MatchResult } from "@/utils/matchingAlgorithm/types";
import { ProfileFormValues } from "@/types/profile";
import { findMatches as findMatchesAlgorithm } from "@/utils/matchingAlgorithm/findMatches";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { UserPreferences } from "@/types/preferences";
import { useUserPreferences } from "./useUserPreferences";

export function useMatching() {
  const [roommates, setRoommates] = useState<MatchResult[]>([]);
  const [properties, setProperties] = useState<MatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [activeTab, setActiveTab] = useState("roommates");
  const [isFindingMatches, setIsFindingMatches] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { preferences } = useUserPreferences();

  const setActiveTabAndClearSelection = (tab: string) => {
    setActiveTab(tab);
    setSelectedMatch(null);
  };

  const handleViewDetails = (match: MatchResult) => {
    setSelectedMatch(match);
  };

  const handleCloseDetails = () => {
    setSelectedMatch(null);
  };

  const findMatches = async (profileData: Partial<ProfileFormValues> | null): Promise<MatchResult[]> => {
    if (!profileData) {
      toast({
        title: "Profile incomplete",
        description: "Please complete your profile before finding matches",
        variant: "destructive",
      });
      throw new Error("Profile data is required");
    }
    
    setIsFindingMatches(true);
    
    try {
      console.log("Finding matches with profile data:", profileData);
      console.log("Current user ID:", user?.id);
      
      // First convert to ProfileFormValues to ensure the right types
      const formValues = profileData as ProfileFormValues;
      
      // Use the algorithm directly on the form values, passing the current user ID and preferences
      const matchesFound = await findMatchesAlgorithm(formValues, user?.id, preferences);
      console.log("Matches found with user preferences:", matchesFound);
      
      // Update state with found matches
      setRoommates(matchesFound);
      
      return matchesFound;
    } catch (error) {
      console.error("Error finding matches:", error);
      toast({
        title: "Error",
        description: "Failed to find matches. Please try again.",
        variant: "destructive",
      });
      throw error;
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
