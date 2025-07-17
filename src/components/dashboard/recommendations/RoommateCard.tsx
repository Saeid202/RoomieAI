
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building, Clock, MapPin, DollarSign, Star, Users, Sparkles, Heart } from "lucide-react";

interface RoommateCardProps {
  match: any;
  onViewDetails: (match: any) => void;
}

// Get match score color based on percentage
const getScoreColor = (score: number) => {
  if (score >= 85) return "bg-green-500 text-white";
  if (score >= 70) return "bg-blue-500 text-white";
  if (score >= 55) return "bg-yellow-500 text-black";
  return "bg-orange-500 text-white";
};

// Get compatibility bar color based on category and score
const getCompatibilityColor = (key: string, score: number) => {
  const baseColors = {
    budget: "bg-green-500",
    location: "bg-blue-500",
    lifestyle: "bg-purple-500",
    schedule: "bg-amber-500",
    interests: "bg-red-500",
    cleanliness: "bg-teal-500"
  };
  
  return baseColors[key as keyof typeof baseColors] || "bg-gray-500";
};

// Format compatibility category names
const formatCategoryName = (key: string) => {
  const names = {
    budget: "Budget",
    location: "Location",
    lifestyle: "Lifestyle",
    schedule: "Schedule",
    interests: "Interests", 
    cleanliness: "Cleanliness"
  };
  return names[key as keyof typeof names] || key;
};

export function RoommateCard({ match, onViewDetails }: RoommateCardProps) {
  // Extract match reasons if available
  const matchReasons = match.matchReasons || match.enhancedReasons || [];
  
  // Get top compatibility scores for highlighting
  const compatibilityEntries = Object.entries(match.compatibilityBreakdown || {})
    .map(([key, value]) => ({ key, value: Number(value) }))
    .sort((a, b) => b.value - a.value);

  const topCategories = compatibilityEntries.slice(0, 3);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Score indicator bar */}
      <div 
        className={`h-3 ${
          match.compatibilityScore >= 85 
            ? "bg-green-500" 
            : match.compatibilityScore >= 70 
              ? "bg-blue-500"
              : match.compatibilityScore >= 55 
                ? "bg-yellow-500" 
                : "bg-orange-500"
        }`} 
      />
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              {match.name}, {match.age}
              {match.compatibilityScore >= 85 && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Users className="h-3 w-3" />
              {match.occupation} • {match.location}
            </CardDescription>
          </div>
          <Badge className={`${getScoreColor(match.compatibilityScore)} font-bold`}>
            {match.compatibilityScore}% Match
          </Badge>
        </div>
        
        {/* Match reasons section */}
        {matchReasons.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Why this is a great match:</p>
            <div className="space-y-1">
              {matchReasons.slice(0, 2).map((reason: string, index: number) => (
                <p key={index} className="text-sm text-green-700 dark:text-green-400 flex items-start gap-1">
                  <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {reason}
                </p>
              ))}
              {matchReasons.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{matchReasons.length - 2} more reasons
                </p>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key details */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Budget:</span>
            </div>
            <span className="text-sm font-medium">
              ${match.budget[0].toLocaleString()} - ${match.budget[1].toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Schedule:</span>
            </div>
            <span className="text-sm font-medium">{match.workSchedule}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Move-in:</span>
            </div>
            <span className="text-sm font-medium">{match.movingDate}</span>
          </div>
        </div>

        {/* Lifestyle badges */}
        <div className="flex flex-wrap gap-1">
          {!match.smoking && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              Non-smoker
            </Badge>
          )}
          {match.pets && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
              Pet-friendly
            </Badge>
          )}
          {match.cleanliness > 75 && (
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
              Very clean
            </Badge>
          )}
          {match.sleepSchedule === "early" && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
              Early bird
            </Badge>
          )}
        </div>
        
        {/* Top compatibility categories */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Compatibility Areas</h4>
          <div className="space-y-2">
            {topCategories.map(({ key, value }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-16 text-xs text-muted-foreground truncate">
                    {formatCategoryName(key)}
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={Math.max(value * 5, 5)} // Convert to percentage and ensure minimum visibility
                      className="h-2"
                    />
                  </div>
                </div>
                <span className="text-xs font-medium w-8 text-right">
                  {Math.round(value)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interests preview */}
        {match.interests && match.interests.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Interests</h4>
            <div className="flex flex-wrap gap-1">
              {match.interests.slice(0, 3).map((interest: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {match.interests.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{match.interests.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onViewDetails(match)}
        >
          View Details
        </Button>
        <Button className="flex-1">
          <Heart className="h-4 w-4 mr-1" />
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
