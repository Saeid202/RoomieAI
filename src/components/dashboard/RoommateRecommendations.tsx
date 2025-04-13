
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchProfileData, getTableNameFromPreference } from "@/services/profileService";
import { findMatches, findPropertyShareMatches } from "@/utils/matchingAlgorithm";
import { mapDbRowToFormValues } from "@/utils/profileDataMappers";
import { UserPreference } from "@/components/dashboard/types";
import { LoadingState } from "./recommendations/LoadingState";
import { EmptyState } from "./recommendations/EmptyState";
import { MatchDetailView } from "./recommendations/MatchDetailView";
import { MatchTabs } from "./recommendations/MatchTabs";

export function RoommateRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState("roommates");
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadProfileAndMatches = async () => {
      try {
        setLoading(true);
        
        // Get the user's preference from localStorage 
        const storedPreference = localStorage.getItem('userPreference');
        
        // Convert string to UserPreference type
        const userPreference: UserPreference = 
          storedPreference === 'roommate' || storedPreference === 'co-owner' 
            ? storedPreference 
            : null;
        
        if (!userPreference) {
          toast({
            title: "Profile not found",
            description: "Please complete your profile to see recommendations",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        const tableName = getTableNameFromPreference(userPreference);
        if (!tableName) {
          setLoading(false);
          return;
        }
        
        // Fetch the user's profile data
        const { data, error } = await fetchProfileData(user.id, tableName);
        
        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error loading profile",
            description: "Could not load your profile data",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        if (!data) {
          toast({
            title: "Profile not found",
            description: "Please complete your profile to see recommendations",
          });
          setLoading(false);
          return;
        }
        
        // Convert the database row to form values
        const formValues = mapDbRowToFormValues(data);
        setProfileData(formValues);
        
        // Find matches using our algorithms
        const roommateMatches = findMatches(formValues);
        const propertyMatches = findPropertyShareMatches(formValues);
        
        setRoommates(roommateMatches);
        setProperties(propertyMatches);
      } catch (error) {
        console.error("Error loading matches:", error);
        toast({
          title: "Error finding matches",
          description: "Could not find roommate matches",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileAndMatches();
  }, [user, toast]);

  if (loading) {
    return <LoadingState />;
  }

  if (!profileData || (!roommates.length && !properties.length)) {
    return <EmptyState />;
  }

  const handleViewDetails = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseDetails = () => {
    setSelectedMatch(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Roommate Recommendations</h1>
      <p className="text-muted-foreground">
        We found {roommates.length + properties.length} matches based on your preferences.
      </p>
      
      {selectedMatch ? (
        <MatchDetailView match={selectedMatch} onClose={handleCloseDetails} />
      ) : (
        <MatchTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          roommates={roommates}
          properties={properties}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}
