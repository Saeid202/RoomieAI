import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Calendar, Users, MessageSquare, Heart, Loader2 } from "lucide-react";
import { MatchResult } from "@/utils/matchingAlgorithm/types";
import { idealRoommateMatchingEngine } from "@/services/idealRoommateMatchingService";
import { useRoommateProfile } from "@/hooks/useRoommateProfile";
import { useAuth } from "@/hooks/useAuth";

interface MatchDisplay {
  id: string;
  name: string;
  age: number;
  location: string;
  compatibility: number;
  housingType: string;
  budget: string;
  moveInDate: string;
  traits: string[];
  bio: string;
  image: string;
}

function convertMatchResultToDisplay(match: MatchResult, index: number): MatchDisplay {
  const budgetStr = Array.isArray(match.budget) 
    ? `$${match.budget[0].toLocaleString()}-${match.budget[1].toLocaleString()}`
    : `$${match.budget}`;

  return {
    id: `match-${index}`,
    name: match.name,
    age: parseInt(match.age),
    location: match.location,
    compatibility: match.compatibilityScore,
    housingType: "Apartment", // Default value since propertyDetails is not available in MatchResult
    budget: budgetStr,
    moveInDate: match.movingDate || "Flexible",
    traits: match.traits || [],
    bio: `${match.occupation || "Professional"} looking for a compatible roommate. Interests include ${match.interests?.slice(0, 2).join(" and ") || "various activities"}.`,
    image: match.name.split(" ").map(n => n[0]).join("")
  };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { profileData, loading: profileLoading } = useRoommateProfile();

  useEffect(() => {
    const loadMatches = async () => {
      if (!profileData || profileLoading) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log("Loading matches with profile data:", profileData);
        
        // Use the enhanced matching algorithm with importance from roommate table
        const idealRoommateResults = await idealRoommateMatchingEngine.findMatches({
          currentUser: profileData,
          currentUserId: user?.id,
          maxResults: 15,
          minScore: 40 // Lower minimum score to get more results
        });

        console.log("Raw ideal roommate matches from algorithm:", idealRoommateResults);
        
        // Convert to standard MatchResult format
        const matchResults = idealRoommateResults.map(result => 
          idealRoommateMatchingEngine.convertToMatchResult(result)
        );
        
        console.log("Converted match results:", matchResults);
        
        // Convert to display format
        const displayMatches = matchResults.map(convertMatchResultToDisplay);
        
        console.log("Processed display matches:", displayMatches);
        console.log("Total matches found:", displayMatches.length);
        displayMatches.forEach((match, index) => {
          console.log(`Match ${index + 1}:`, {
            name: match.name,
            age: match.age,
            location: match.location,
            compatibility: `${match.compatibility}%`,
            budget: match.budget,
            traits: match.traits,
            bio: match.bio
          });
        });
        
        setMatches(displayMatches);
      } catch (error) {
        console.error("Error loading matches:", error);
        setError("Failed to load matches. Please try again.");
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [profileData, profileLoading, user?.id]);
  if (loading || profileLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {profileLoading ? "Loading your profile..." : 
               "Finding compatible matches..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
            <p className="text-muted-foreground mb-4">
              Please complete your profile to start finding compatible roommates
            </p>
            <Button onClick={() => window.location.href = '/dashboard/profile'}>
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Matches</h1>
          <p className="text-muted-foreground mt-2">
            Found {matches.length} compatible roommates based on your preferences
          </p>
        </div>
        <Button variant="outline">
          <Heart className="w-4 h-4 mr-2" />
          Saved Matches
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {match.image}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{match.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Age {match.age}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-semibold">
                  {match.compatibility}% match
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {match.bio}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  {match.location}
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  Move-in: {match.moveInDate}
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                  {match.housingType} • {match.budget}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {match.traits.map((trait, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {matches.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete your profile to start finding compatible roommates
            </p>
            <Button>Complete Profile</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}