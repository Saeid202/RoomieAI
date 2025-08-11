import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageSquare, 
  Heart, 
  Loader2, 
  Star,
  TrendingUp,
  Filter,
  SortDesc,
  Info,
  Target,
  BarChart3,
  Sparkles
} from "lucide-react";
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
  matchReasons?: string[];
  compatibilityBreakdown?: any;
}

interface MatchStats {
  total: number;
  excellent: number; // 85%+
  great: number;     // 70-84%
  good: number;      // 55-69%
  average: number;   // <55%
  averageScore: number;
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
    image: match.name.split(" ").map(n => n[0]).join(""),
    matchReasons: match.enhancedReasons || [],
    compatibilityBreakdown: match.compatibilityBreakdown
  };
}

function calculateMatchStats(matches: MatchDisplay[]): MatchStats {
  if (matches.length === 0) {
    return { total: 0, excellent: 0, great: 0, good: 0, average: 0, averageScore: 0 };
  }

  const stats = matches.reduce((acc, match) => {
    if (match.compatibility >= 85) acc.excellent++;
    else if (match.compatibility >= 70) acc.great++;
    else if (match.compatibility >= 55) acc.good++;
    else acc.average++;
    return acc;
  }, { excellent: 0, great: 0, good: 0, average: 0 });

  const averageScore = matches.reduce((sum, match) => sum + match.compatibility, 0) / matches.length;

  return {
    total: matches.length,
    ...stats,
    averageScore: Math.round(averageScore)
  };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'compatibility' | 'age' | 'name'>('compatibility');
  const [filterBy, setFilterBy] = useState<'all' | 'excellent' | 'great' | 'good'>('all');
  
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
          maxResults: 20, // Increased to get more results
          minScore: 30 // Lower minimum score to get more results
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

  // Filter and sort matches
  const filteredAndSortedMatches = matches
    .filter(match => {
      if (filterBy === 'all') return true;
      if (filterBy === 'excellent') return match.compatibility >= 85;
      if (filterBy === 'great') return match.compatibility >= 70 && match.compatibility < 85;
      if (filterBy === 'good') return match.compatibility >= 55 && match.compatibility < 70;
      return false;
    })
    .sort((a, b) => {
      if (sortBy === 'compatibility') return b.compatibility - a.compatibility;
      if (sortBy === 'age') return a.age - b.age;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const stats = calculateMatchStats(matches);

  if (loading || profileLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {profileLoading ? "Loading your profile..." : 
               "Finding compatible matches using your importance preferences..."}
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
              Please complete your profile and set your ideal roommate preferences to start finding compatible roommates
            </p>
            <Button onClick={() => window.location.href = '/dashboard/roommate-recommendations'}>
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Roommate Matches</h1>
            <p className="text-muted-foreground mt-2">
              Based on your ideal roommate preferences and importance settings
            </p>
          </div>
          <Button variant="outline">
            <Heart className="w-4 h-4 mr-2" />
            Saved Matches
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Matches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
              <div className="text-sm text-muted-foreground">Excellent (85%+)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.great}</div>
              <div className="text-sm text-muted-foreground">Great (70-84%)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.good}</div>
              <div className="text-sm text-muted-foreground">Good (55-69%)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Avg. Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Importance-based matching info */}
        {matches.length > 0 && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Matches are ranked using your importance weights: <strong>Must Have</strong> preferences 
              act as filters, <strong>Important</strong> preferences are weighted at 70%, and 
              <strong>Not Important</strong> preferences at 30%. Higher compatibility scores indicate 
              better alignment with your most important preferences.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matches ({stats.total})</SelectItem>
                <SelectItem value="excellent">Excellent ({stats.excellent})</SelectItem>
                <SelectItem value="great">Great ({stats.great})</SelectItem>
                <SelectItem value="good">Good ({stats.good})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <SortDesc className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compatibility">Compatibility</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredAndSortedMatches.length} of {stats.total} matches
          </div>
        </div>
      </div>

      <Separator />

      {/* Matches Grid */}
      {filteredAndSortedMatches.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedMatches.map((match) => (
            <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div 
                className={`h-3 ${
                  match.compatibility >= 85 
                    ? "bg-green-500" 
                    : match.compatibility >= 70 
                      ? "bg-blue-500"
                      : match.compatibility >= 55 
                        ? "bg-yellow-500" 
                        : "bg-orange-500"
                }`} 
              />
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {match.image}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {match.name}
                        {match.compatibility >= 85 && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Age {match.age}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    {match.compatibility}% match
                  </Badge>
                </div>

                {/* Match reasons preview */}
                {match.matchReasons && match.matchReasons.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Top reasons:</p>
                    <p className="text-sm text-green-700 dark:text-green-400 line-clamp-2">
                      {match.matchReasons[0]}
                    </p>
                  </div>
                )}
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

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    View Details
                  </Button>
                  <Button className="flex-1" size="sm">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground mb-4">
              {filterBy === 'all' 
                ? "Try adjusting your ideal roommate preferences or importance settings to find more matches."
                : "Try selecting a different filter level to see more matches."
              }
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setFilterBy('all')}>
                Show All Matches
              </Button>
              <Button onClick={() => window.location.href = '/dashboard/roommate-recommendations'}>
                Update Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}