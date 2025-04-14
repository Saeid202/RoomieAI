
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Accordion } from "@/components/ui/accordion";
import { fetchProfileData, getTableNameFromPreference } from "@/services/profileService";
import { findMatches, findPropertyShareMatches } from "@/utils/matchingAlgorithm";
import { mapDbRowToFormValues } from "@/utils/profileDataMappers";
import { UserPreference } from "@/components/dashboard/types";
import { ProfileFormValues } from "@/types/profile";
import { LoadingState } from "./recommendations/LoadingState";
import { AboutMeSection } from "./recommendations/AboutMeSection";
import { IdealRoommateSection } from "./recommendations/IdealRoommateSection";
import { AIAssistantSection } from "./recommendations/AIAssistantSection";
import { ResultsSection } from "./recommendations/ResultsSection";

export function RoommateRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);
  const [roommates, setRoommates] = useState([]);
  const [properties, setProperties] = useState([]);
  const [activeAboutMeTab, setActiveAboutMeTab] = useState("personal-info");
  const [activeIdealRoommateTab, setActiveIdealRoommateTab] = useState("preferences");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(["about-me", "ideal-roommate", "ai-assistant"]);
  const [activeTab, setActiveTab] = useState("roommates");

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleSaveProfile = async (formData: ProfileFormValues) => {
    // This will be implemented for saving profile data
    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully",
    });
  };

  const handleViewDetails = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseDetails = () => {
    setSelectedMatch(null);
  };

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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Find My Ideal Roommate</h1>
      <p className="text-muted-foreground">
        Let's find you the perfect roommate match based on your preferences!
      </p>
      
      <div className="space-y-6">
        {/* Accordion sections */}
        <Accordion 
          type="multiple" 
          value={expandedSections} 
          onValueChange={setExpandedSections}
          className="w-full"
        >
          <AboutMeSection
            expandedSections={expandedSections}
            profileData={profileData}
            activeAboutMeTab={activeAboutMeTab}
            setActiveAboutMeTab={setActiveAboutMeTab}
            handleSaveProfile={handleSaveProfile}
          />

          <IdealRoommateSection
            expandedSections={expandedSections}
            profileData={profileData}
            activeIdealRoommateTab={activeIdealRoommateTab}
            setActiveIdealRoommateTab={setActiveIdealRoommateTab}
            handleSaveProfile={handleSaveProfile}
          />

          <AIAssistantSection
            expandedSections={expandedSections}
          />
        </Accordion>

        {/* Results Section - Only show if there are matches */}
        {(roommates.length > 0 || properties.length > 0) && (
          <ResultsSection
            roommates={roommates}
            properties={properties}
            selectedMatch={selectedMatch}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onViewDetails={handleViewDetails}
            onCloseDetails={handleCloseDetails}
          />
        )}
      </div>
    </div>
  );
}
