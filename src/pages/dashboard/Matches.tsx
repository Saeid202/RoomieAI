import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Calendar, Users, MessageSquare, Heart } from "lucide-react";

// Mock data for matches - this would come from your matching algorithm
const mockMatches = [
  {
    id: 1,
    name: "Sarah Chen",
    age: 28,
    location: "Downtown, Seattle",
    compatibility: 95,
    housingType: "Apartment",
    budget: "$1,200-1,500",
    moveInDate: "March 2024",
    traits: ["Clean", "Quiet", "Professional"],
    bio: "Software engineer looking for a quiet, clean roommate. I enjoy cooking and weekend hiking.",
    image: "SC"
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    age: 25,
    location: "Capitol Hill, Seattle", 
    compatibility: 88,
    housingType: "House",
    budget: "$800-1,200",
    moveInDate: "April 2024",
    traits: ["Social", "Pet-friendly", "Student"],
    bio: "Graduate student who loves music and cooking. Looking for someone who's okay with occasional guests.",
    image: "MR"
  },
  {
    id: 3,
    name: "Emma Thompson",
    age: 30,
    location: "Fremont, Seattle",
    compatibility: 82,
    housingType: "Apartment",
    budget: "$1,000-1,400",
    moveInDate: "May 2024", 
    traits: ["Organized", "Non-smoker", "Early riser"],
    bio: "Marketing professional with a love for yoga and healthy living. Seeking a like-minded roommate.",
    image: "ET"
  }
];

export default function MatchesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Matches</h1>
          <p className="text-muted-foreground mt-2">
            Found {mockMatches.length} compatible roommates based on your preferences
          </p>
        </div>
        <Button variant="outline">
          <Heart className="w-4 h-4 mr-2" />
          Saved Matches
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockMatches.map((match) => (
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

      {mockMatches.length === 0 && (
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