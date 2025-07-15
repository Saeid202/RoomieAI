import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Calendar, Users, MessageSquare, Heart } from "lucide-react";
import { getMockRoommates } from "@/utils/matchingAlgorithm/mockData";
import { MatchResult } from "@/utils/matchingAlgorithm/types";

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
    housingType: match.propertyDetails?.propertyType || "Apartment",
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

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const dbMatches = await getMockRoommates();
        const displayMatches = dbMatches
          .map(convertMatchResultToDisplay)
          .filter(match => match.compatibility > 40); // Only show matches with score > 40
        setMatches(displayMatches);
      } catch (error) {
        console.error("Error loading matches:", error);
        // Fallback to empty array
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
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