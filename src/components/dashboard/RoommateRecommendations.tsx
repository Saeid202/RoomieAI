
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Bed, Users, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchProfileData, getTableNameFromPreference } from "@/services/profileService";
import { findMatches, findPropertyShareMatches } from "@/utils/matchingAlgorithm";
import { mapDbRowToFormValues } from "@/utils/profileDataMappers";
import { UserPreference } from "@/components/dashboard/types";
import { CompatibilityBreakdown } from "./CompatibilityBreakdown";

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
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Roommate Recommendations</h1>
        <p className="text-muted-foreground">Finding your ideal matches...</p>
        
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-muted h-24" />
              <CardContent className="pt-6 space-y-4">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profileData || (!roommates.length && !properties.length)) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Roommate Recommendations</h1>
        <p className="text-muted-foreground">No matches found based on your preferences.</p>
        
        <Card>
          <CardHeader>
            <CardTitle>No Matches Found</CardTitle>
            <CardDescription>
              We couldn't find any matches based on your current profile settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Try updating your preferences to see more potential matches:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Adjust your budget range</li>
              <li>Consider different locations</li>
              <li>Update your lifestyle preferences</li>
              <li>Change your roommate preferences</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.href = '/dashboard/profile'} className="w-full">
              Update Your Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
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
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Match Details: {selectedMatch.name}</CardTitle>
              <Button variant="outline" onClick={handleCloseDetails}>Back to matches</Button>
            </div>
            <CardDescription>Compatibility score: {selectedMatch.compatibilityScore}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Details</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span>{selectedMatch.age}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span>{selectedMatch.gender}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Occupation:</span>
                    <span>{selectedMatch.occupation}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{selectedMatch.location}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Budget range:</span>
                    <span>${selectedMatch.budget[0]} - ${selectedMatch.budget[1]}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Move-in date:</span>
                    <span>{selectedMatch.movingDate}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Compatibility Breakdown</h3>
                <CompatibilityBreakdown 
                  breakdown={selectedMatch.compatibilityBreakdown} 
                  overallScore={selectedMatch.compatibilityScore}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Lifestyle</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Smoking:</span>
                  <span>{selectedMatch.smoking ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pets:</span>
                  <span>{selectedMatch.pets ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests:</span>
                  <span>{selectedMatch.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sleep schedule:</span>
                  <span>{selectedMatch.sleepSchedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Work schedule:</span>
                  <span>{selectedMatch.workSchedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cleanliness:</span>
                  <span>{Math.round(selectedMatch.cleanliness)}%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Interests & Traits</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.interests.map((interest, i) => (
                  <span key={i} className="bg-muted px-2 py-1 rounded-md text-xs">
                    {interest}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.traits.map((trait, i) => (
                  <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Contact {selectedMatch.name}</Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="roommates" className="flex items-center gap-2">
              <Users size={16} />
              <span>Roommates ({roommates.length})</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building size={16} />
              <span>Property Sharing ({properties.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roommates" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roommates.map((match, index) => (
                <Card key={index} className="overflow-hidden">
                  <div 
                    className={`h-2 ${
                      match.compatibilityScore > 80 
                        ? "bg-green-500" 
                        : match.compatibilityScore > 60 
                          ? "bg-yellow-500" 
                          : "bg-orange-500"
                    }`} 
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{match.name}, {match.age}</CardTitle>
                      <div className="bg-muted px-2 py-1 rounded-full font-semibold text-sm">
                        {match.compatibilityScore}% Match
                      </div>
                    </div>
                    <CardDescription>{match.occupation} • {match.location}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>Budget:</span>
                        </div>
                        <span className="text-sm font-medium">${match.budget[0]} - ${match.budget[1]}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Schedule:</span>
                        </div>
                        <span className="text-sm font-medium">{match.workSchedule}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Compatibility</h4>
                      <div className="space-y-2">
                        {Object.entries(match.compatibilityBreakdown).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <div className="bg-muted h-2 rounded-full flex-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  key === 'schedule' 
                                    ? 'bg-blue-500' 
                                    : key === 'budget' 
                                      ? 'bg-green-500' 
                                      : key === 'lifestyle' 
                                        ? 'bg-purple-500' 
                                        : 'bg-amber-500'
                                }`} 
                                style={{ width: `${Math.round(Number(value) * 5)}%` }} 
                              />
                            </div>
                            <span className="text-xs">{key}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewDetails(match)}
                    >
                      View Details
                    </Button>
                    <Button className="flex-1">Contact</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="properties" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property, index) => (
                <Card key={index} className="overflow-hidden">
                  <div 
                    className={`h-2 ${
                      property.compatibilityScore > 80 
                        ? "bg-green-500" 
                        : property.compatibilityScore > 60 
                          ? "bg-yellow-500" 
                          : "bg-orange-500"
                    }`} 
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Share with {property.name}</CardTitle>
                      <div className="bg-muted px-2 py-1 rounded-full font-semibold text-sm">
                        {property.compatibilityScore}% Match
                      </div>
                    </div>
                    <CardDescription>{property.propertyDetails?.address || property.location}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-muted px-2 py-1 rounded-md text-xs flex items-center gap-1">
                        <Building size={12} />
                        <span>{property.propertyDetails?.propertyType || "Apartment"}</span>
                      </div>
                      <div className="bg-muted px-2 py-1 rounded-md text-xs flex items-center gap-1">
                        <Bed size={12} />
                        <span>{property.propertyDetails?.bedrooms || "1"} BR</span>
                      </div>
                      <div className="bg-muted px-2 py-1 rounded-md text-xs">
                        {property.workSchedule}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span>Monthly rent:</span>
                        </div>
                        <span className="text-sm font-medium">${Math.round(property.budget[0] / 2)} - ${Math.round(property.budget[1] / 2)} /person</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span>Move-in:</span>
                        </div>
                        <span className="text-sm font-medium">{property.movingDate}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">About {property.name}:</h4>
                      <p className="text-sm text-muted-foreground">
                        {property.age}-year-old {property.gender}, works as a {property.occupation}.
                        {property.smoking ? " Smoker." : " Non-smoker."} 
                        {property.pets ? " Has pets." : " No pets."}
                      </p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewDetails(property)}
                    >
                      View Details
                    </Button>
                    <Button className="flex-1">Contact</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
