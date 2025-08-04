
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
    <Card className="overflow-hidden hover:shadow-lg active:scale-95 transition-all duration-300 rounded-3xl border-border/20 bg-background/95 backdrop-blur-sm">
      {/* Enhanced score indicator bar with gradient */}
      <div 
        className={`h-2 ${
          match.compatibilityScore >= 85 
            ? "bg-gradient-to-r from-green-400 to-green-600" 
            : match.compatibilityScore >= 70 
              ? "bg-gradient-to-r from-blue-400 to-blue-600"
              : match.compatibilityScore >= 55 
                ? "bg-gradient-to-r from-yellow-400 to-yellow-600" 
                : "bg-gradient-to-r from-orange-400 to-orange-600"
        }`} 
      />
      
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
              {match.name}, {match.age}
              {match.compatibilityScore >= 85 && (
                <Star className="h-5 w-5 text-yellow-500 fill-current flex-shrink-0" />
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2 text-base">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{match.occupation} • {match.location}</span>
            </CardDescription>
          </div>
          <Badge className={`${getScoreColor(match.compatibilityScore)} font-bold text-sm px-3 py-2 rounded-2xl flex-shrink-0 shadow-sm`}>
            {match.compatibilityScore}% Match
          </Badge>
        </div>
        
        {/* Enhanced match reasons section */}
        {matchReasons.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200/50 dark:border-green-800/50">
            <p className="text-base font-semibold text-green-800 dark:text-green-200 mb-3">Why this is a great match:</p>
            <div className="space-y-2">
              {matchReasons.slice(0, 2).map((reason: string, index: number) => (
                <p key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2 leading-relaxed">
                  <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  {reason}
                </p>
              ))}
              {matchReasons.length > 2 && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">
                  +{matchReasons.length - 2} more reasons to connect
                </p>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6 px-6 pb-6">
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
      
      <CardFooter className="flex gap-3 pt-6 px-6 pb-6">
        <Button 
          variant="outline" 
          className="flex-1 h-12 rounded-2xl font-medium border-2 hover:border-primary hover:bg-primary/5 transition-colors"
          onClick={() => onViewDetails(match)}
        >
          View Details
        </Button>
        <Button className="flex-1 h-12 rounded-2xl font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all">
          <Heart className="h-4 w-4 mr-2" />
          Connect
        </Button>
      </CardFooter>
    </Card>
  );
}
