import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchProfileData, getTableNameFromPreference } from "@/services/profileService";
import { findMatches, findPropertyShareMatches } from "@/utils/matchingAlgorithm";
import { mapDbRowToFormValues } from "@/utils/profileDataMappers";
import { UserPreference } from "@/components/dashboard/types";
import { LoadingState } from "./recommendations/LoadingState";
import { EmptyState } from "./recommendations/EmptyState";
import { MatchDetailView } from "./recommendations/MatchDetailView";
import { MatchTabs } from "./recommendations/MatchTabs";
import { User, Home, Zap, Users, Settings, Heart, Sofa, Ban, MessageSquare } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import { ProfileFormValues } from "@/types/profile";

const AboutMeTabs = [
  { id: "personal-info", label: "1️⃣ Personal Info", icon: User },
  { id: "housing", label: "2️⃣ Housing", icon: Home },
  { id: "lifestyle", label: "3️⃣ Lifestyle", icon: Zap },
  { id: "social-cleaning", label: "4️⃣ Social & Cleaning", icon: Users }
];

const IdealRoommateTabs = [
  { id: "preferences", label: "1️⃣ Preferences", icon: Settings },
  { id: "lifestyle-match", label: "2️⃣ Lifestyle Match", icon: Heart },
  { id: "house-habits", label: "3️⃣ House Habits", icon: Sofa },
  { id: "deal-breakers", label: "4️⃣ Deal Breakers", icon: Ban }
];

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

  // We'll use this for form display logic
  const renderFormContentForAboutMe = (tabId: string) => {
    if (!profileData) return <div>Please complete your profile</div>;
    
    // We'll keep using existing form components, but showing only relevant sections
    switch (tabId) {
      case "personal-info":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Tell us about yourself! 😊</h3>
            <p className="text-muted-foreground">Let's get to know the amazing human behind the screen! No pressure, we're just nosy. 🧐</p>
            <ProfileForm 
              initialData={profileData} 
              onSave={handleSaveProfile} 
            />
          </div>
        );
      case "housing":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Home Sweet Home? 🏠</h3>
            <p className="text-muted-foreground">Tell us about your dream pad! Mansion or shoebox, we don't judge (much). 😉</p>
            <ProfileForm 
              initialData={profileData} 
              onSave={handleSaveProfile} 
            />
          </div>
        );
      case "lifestyle":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Living La Vida Loca? 🎭</h3>
            <p className="text-muted-foreground">Early bird or night owl? Party animal or Netflix champion? Spill the beans! 🦉</p>
            <ProfileForm 
              initialData={profileData} 
              onSave={handleSaveProfile} 
            />
          </div>
        );
      case "social-cleaning":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Clean Freak or Chaos Creator? 🧹</h3>
            <p className="text-muted-foreground">Do you see dust bunnies as pets or enemies? Let's dish the dirt on your cleaning habits! 🧼</p>
            <ProfileForm 
              initialData={profileData} 
              onSave={handleSaveProfile} 
            />
          </div>
        );
      default:
        return <div>Select a tab to continue</div>;
    }
  };

  const renderFormContentForIdealRoommate = (tabId: string) => {
    if (!profileData) return <div>Please complete your profile</div>;
    
    switch (tabId) {
      case "preferences":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Your Dream Roomie! 🌈</h3>
            <p className="text-muted-foreground">Seeking a neat freak? A fellow pizza enthusiast? A plant parent? Let's find your perfect match! 🔍</p>
            <ProfileForm 
              initialData={profileData} 
              onSave={handleSaveProfile} 
            />
          </div>
        );
      case "lifestyle-match":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Lifestyle Twins or Opposites? 🎭</h3>
            <p className="text-muted-foreground">Does your ideal roomie need to match your wild party schedule or balance it out? No wrong answers! 🎉</p>
            <ProfileForm 
              initialData={profileData} 
              onSave={handleSaveProfile} 
            />
          </div>
        );
      case "house-habits":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">House Rules & Habits! 🏡</h3>
            <p className="text-muted-foreground">Seeking someone who shares your "dishes don't wash themselves" philosophy? Let's set some ground rules! 📝</p>
            <ProfileForm 
              initialData={profileData} 
              onSave={handleSaveProfile} 
            />
          </div>
        );
      case "deal-breakers":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Absolutely Not! 🙅‍♂️</h3>
            <p className="text-muted-foreground">What crosses the line? Midnight drum practice? Pineapple on pizza? We won't judge (much)! 🍍</p>
            <ProfileForm 
              initialData={profileData} 
              onSave={handleSaveProfile} 
            />
          </div>
        );
      default:
        return <div>Select a tab to continue</div>;
    }
  };

  const handleViewDetails = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseDetails = () => {
    setSelectedMatch(null);
  };

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
        {/* About Me Section */}
        <Accordion 
          type="multiple" 
          value={expandedSections} 
          onValueChange={setExpandedSections}
          className="w-full"
        >
          <AccordionItem value="about-me" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="text-xl font-semibold">About Me</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Card>
                <CardContent className="p-4">
                  <Tabs value={activeAboutMeTab} onValueChange={setActiveAboutMeTab}>
                    <TabsList className="w-full grid grid-cols-4">
                      {AboutMeTabs.map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                          <tab.icon className="h-4 w-4" />
                          <span className="hidden md:inline">{tab.label}</span>
                          <span className="inline md:hidden">{tab.id.split('-')[0]}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {AboutMeTabs.map(tab => (
                      <TabsContent key={tab.id} value={tab.id} className="pt-4">
                        {renderFormContentForAboutMe(tab.id)}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* My Ideal Roommate Section */}
          <AccordionItem value="ideal-roommate" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-xl font-semibold">My Ideal Roommate</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Card>
                <CardContent className="p-4">
                  <Tabs value={activeIdealRoommateTab} onValueChange={setActiveIdealRoommateTab}>
                    <TabsList className="w-full grid grid-cols-4">
                      {IdealRoommateTabs.map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                          <tab.icon className="h-4 w-4" />
                          <span className="hidden md:inline">{tab.label}</span>
                          <span className="inline md:hidden">{tab.id.split('-')[0]}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {IdealRoommateTabs.map(tab => (
                      <TabsContent key={tab.id} value={tab.id} className="pt-4">
                        {renderFormContentForIdealRoommate(tab.id)}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* AI Match Assistant Section */}
          <AccordionItem value="ai-assistant" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span className="text-xl font-semibold">AI Match Assistant</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-purple-800 mb-2">
                        How our AI helps you find your perfect match
                      </h3>
                      <p className="text-gray-700">
                        Our intelligent matching system analyzes your preferences, lifestyle, and habits to find roommates that are truly compatible with you. We go beyond just basic preferences to understand your living style.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-800 mb-2">
                        Need to add anything else?
                      </h3>
                      <p className="text-gray-700">
                        Is there anything specific you're looking for in a roommate that we didn't ask? Tell us below and we'll consider it in our matching algorithm.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Chat with our AI Assistant
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button 
                        size="lg" 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Find My Matches Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Results Section - Only show if there are matches */}
        {(roommates.length > 0 || properties.length > 0) && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Your Matches</h2>
              <p className="mb-6">
                Based on your preferences, we found {roommates.length + properties.length} potential matches!
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
