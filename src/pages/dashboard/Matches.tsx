import { useState, useEffect, useCallback } from "react";
import { MessagingService } from "@/services/messagingService";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Sparkles,
  Home,
  Briefcase,
} from "lucide-react";
import { MatchResult } from "@/utils/matchingAlgorithm/types";
import { idealRoommateMatchingEngine } from "@/services/idealRoommateMatchingService";
import { useRoommateProfile } from "@/hooks/useRoommateProfile";
import { useAuth } from "@/hooks/useAuth";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { TabsSection } from "@/components/dashboard/recommendations/components/TabsSection";
import { ResultsSection } from "@/components/dashboard/recommendations/ResultsSection";
import { useNavigate, useLocation } from "react-router-dom";
import { MatchDetailView } from "@/components/dashboard/recommendations/MatchDetailView";

interface MatchDisplay {
  userId?: string;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  compatibilityBreakdown?: any;
}

interface MatchStats {
  total: number;
  excellent: number; // 85%+
  great: number; // 70-84%
  good: number; // 55-69%
  average: number; // <55%
  averageScore: number;
}

function convertMatchResultToDisplay(
  match: MatchResult,
  index: number
): MatchDisplay {
  const budgetStr = Array.isArray(match.budget)
    ? `$${match.budget[0].toLocaleString()}-${match.budget[1].toLocaleString()}`
    : `$${match.budget}`;

  return {
    userId: match.userId,
    id: `match-${index}`,
    name: match.name,
    age: parseInt(match.age),
    location: match.location,
    compatibility: match.compatibilityScore,
    housingType: "Apartment", // Default value since propertyDetails is not available in MatchResult
    budget: budgetStr,
    moveInDate: match.movingDate || "Flexible",
    traits: match.traits || [],
    bio: `${match.occupation || "Professional"
      } looking for a compatible roommate. Interests include ${match.interests?.slice(0, 2).join(" and ") || "various activities"
      }.`,
    image: match.name
      .split(" ")
      .map((n) => n[0])
      .join(""),
    matchReasons: match.enhancedReasons || [],
    compatibilityBreakdown: match.compatibilityBreakdown,
  };
}

function calculateMatchStats(matches: MatchDisplay[]): MatchStats {
  if (matches.length === 0) {
    return {
      total: 0,
      excellent: 0,
      great: 0,
      good: 0,
      average: 0,
      averageScore: 0,
    };
  }

  const stats = matches.reduce(
    (acc, match) => {
      if (match.compatibility >= 85) acc.excellent++;
      else if (match.compatibility >= 70) acc.great++;
      else if (match.compatibility >= 55) acc.good++;
      else acc.average++;
      return acc;
    },
    { excellent: 0, great: 0, good: 0, average: 0 }
  );

  const averageScore =
    matches.reduce((sum, match) => sum + match.compatibility, 0) /
    matches.length;

  return {
    total: matches.length,
    ...stats,
    averageScore: Math.round(averageScore),
  };
}

export default function MatchesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"compatibility" | "age" | "name">(
    "compatibility"
  );
  const [filterBy, setFilterBy] = useState<
    "all" | "excellent" | "great" | "good"
  >("all");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [startingChatId, setStartingChatId] = useState<string | null>(null);
  const { toast } = useToast();

  const { user } = useAuth();
  const { profileData, loading: profileLoading } = useRoommateProfile();

  const {
    roommates,
    properties,
    selectedMatch,
    activeTab,
    setActiveTab,
    handleViewDetails,
    handleCloseDetails,
    findMatches,
    handleSaveProfile,
  } = useRoommateMatching();

  const handleContact = async (matchUserId: string | undefined) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to send messages.",
        variant: "destructive",
      });
      return;
    }

    if (!matchUserId) {
      toast({
        title: "Error",
        description: "Cannot message this user (User ID missing).",
        variant: "destructive",
      });
      return;
    }

    try {
      setStartingChatId(matchUserId);
      const conversationId = await MessagingService.startDirectChat(user.id, matchUserId);
      navigate(`/dashboard/chats?conversation=${conversationId}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setStartingChatId(null);
    }
  };

  const handleTabChange = useCallback(
    (value: string) => {
      // Only navigate if the URL doesn't match the new value to avoid loops or redundant history
      const searchParams = new URLSearchParams(location.search);
      const currentTab = searchParams.get("tab") || "matches";

      if (value !== currentTab) {
        if (value === "matches") {
          navigate("/dashboard/matches");
        } else {
          navigate(`/dashboard/matches?tab=${value}`);
        }
      }

      setActiveTab(value);
      if (value === "matches") {
        setExpandedSections([]);
        return;
      }
      if (!expandedSections.includes("about-me") && value === "about-me") {
        setExpandedSections((prev) => [...prev, "about-me"]);
      } else if (
        !expandedSections.includes("ideal-roommate") &&
        value === "ideal-roommate"
      ) {
        setExpandedSections((prev) => [...prev, "ideal-roommate"]);
      }
    },
    [expandedSections, setActiveTab, navigate, location.search]
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    if (tab && (tab === "about-me" || tab === "ideal-roommate" || tab === "matches")) {
      handleTabChange(tab);
    } else {
      handleTabChange("matches");
    }
  }, [handleTabChange, location.search]);

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
        const idealRoommateResults =
          await idealRoommateMatchingEngine.findMatches({
            currentUser: profileData,
            currentUserId: user?.id,
            maxResults: 20, // Increased to get more results
            minScore: 30, // Lower minimum score to get more results
          });

        console.log(
          "Raw ideal roommate matches from algorithm:",
          idealRoommateResults
        );

        // Convert to standard MatchResult format
        const matchResults = idealRoommateResults.map((result) =>
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
            bio: match.bio,
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
    .filter((match) => {
      if (filterBy === "all") return true;
      if (filterBy === "excellent") return match.compatibility >= 85;
      if (filterBy === "great")
        return match.compatibility >= 70 && match.compatibility < 85;
      if (filterBy === "good")
        return match.compatibility >= 55 && match.compatibility < 70;
      return false;
    })
    .sort((a, b) => {
      if (sortBy === "compatibility") return b.compatibility - a.compatibility;
      if (sortBy === "age") return a.age - b.age;
      if (sortBy === "name") return a.name.localeCompare(b.name);
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
              {profileLoading
                ? "Loading your profile..."
                : "Finding compatible matches using your importance preferences..."}
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
            <h3 className="text-lg font-semibold mb-2">
              Complete Your Profile
            </h3>
            <p className="text-muted-foreground mb-4">
              Please complete your profile and set your ideal roommate
              preferences to start finding compatible roommates
            </p>
            <Button
              onClick={() =>
                (window.location.href = "/dashboard/roommate-recommendations")
              }
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {selectedMatch ? (
        <MatchDetailView match={selectedMatch} onClose={handleCloseDetails} />
      ) : (
        <>
          {/* Header with Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg md:text-3xl font-bold">Your Roommate Matches</h1>
              </div>
              <Button
                variant="outline"
                className="text-xs md:text-base gap-1 md:gap-2"
              >
                <Heart className="size-1 md:size-4 md:mr-2" />
                Saved Matches

              </Button>
            </div>



            {/* Mobile-optimized profile section */}
            <div className="w-full !mt-0">
              <div className="bg-background/95 backdrop-blur-sm">
                <div className="px-4 py-2 md:!p-6">
                  <TabsSection
                    activeTab={activeTab}
                    expandedSections={expandedSections}
                    setExpandedSections={setExpandedSections}
                    handleTabChange={handleTabChange}
                    profileData={profileData}
                    onSaveProfile={handleSaveProfile}
                  >
                    <ResultsSection
                      roommates={roommates}
                      properties={properties}
                      selectedMatch={selectedMatch}
                      activeTab="roommates"
                      setActiveTab={setActiveTab}
                      onViewDetails={handleViewDetails}
                      onCloseDetails={handleCloseDetails}
                    />
                  </TabsSection>
                </div>
              </div>
            </div>

            {/* Filters and Sorting */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter:</span>
                <Select
                  value={filterBy}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onValueChange={(value: any) => setFilterBy(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Matches ({stats.total})</SelectItem>
                    <SelectItem value="excellent">
                      Excellent ({stats.excellent})
                    </SelectItem>
                    <SelectItem value="great">Great ({stats.great})</SelectItem>
                    <SelectItem value="good">Good ({stats.good})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <SortDesc className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sort by:</span>
                <Select
                  value={sortBy}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onValueChange={(value: any) => setSortBy(value)}
                >
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

          {/* Matches Grid — Youth-Focused Social UI */}
          {filteredAndSortedMatches.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedMatches.map((match) => (
                <Card
                  key={match.id}
                  className="group relative flex flex-col bg-white/80 backdrop-blur-sm rounded-[20px] shadow-xl hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden hover:-translate-y-1"
                >
                  <div className="p-6 md:p-7 flex flex-col h-full space-y-5">

                    {/* 1) Header - Human Identity */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 border-2 border-purple-100 shadow-sm">
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base">
                            {match.image}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            {match.name.split(' ')[0]}, {match.age}
                          </h3>
                          <span className="text-[11px] font-medium text-slate-400">
                            Based on lifestyle & habits
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={`rounded-full px-3 py-1 border-none font-bold text-[10px] tracking-tight shadow-sm ${match.compatibility >= 85 ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white' :
                          match.compatibility >= 70 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
                            'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                          }`}
                      >
                        {match.compatibility}% Match
                      </Badge>
                    </div>

                    {/* 2) Main Intent - BIG BOLD TEXT */}
                    <div className="pt-2">
                      <p className="text-[19px] font-extrabold text-slate-800 leading-[1.3] tracking-tight line-clamp-2">
                        “{match.bio.split('.')[0] || "Looking for a compatible roommate for a shared lifestyle."}”
                      </p>
                    </div>

                    {/* 3) Key Traits - Visual Chips */}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full text-[11px] font-bold">
                        <Briefcase className="h-3.5 w-3.5" />
                        Professional
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-bold">
                        <Home className="h-3.5 w-3.5" />
                        {match.housingType}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[11px] font-bold">
                        <Calendar className="h-3.5 w-3.5" />
                        {match.moveInDate.includes('20') ? 'Timeline Set' : match.moveInDate}
                      </div>
                    </div>

                    {/* 4) Quick Bio Highlight */}
                    {match.bio && (
                      <div className="pt-1">
                        <p className="text-[13px] text-slate-500 italic leading-relaxed line-clamp-2">
                          {match.bio.split('.').slice(1).join('.').trim() || "Values clean shared spaces and mutual respect."}
                        </p>
                      </div>
                    )}

                    {/* 5) Actions - Strong CTA */}
                    <div className="pt-4 mt-auto flex items-center gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-sm h-12 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        onClick={() => handleContact(match.userId)}
                        disabled={startingChatId === match.userId}
                      >
                        {startingChatId === match.userId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Say Hi 👋"
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-12 h-12 rounded-2xl border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95 group/save p-0"
                      >
                        <Heart className="h-5 w-5 transition-colors group-hover/save:fill-rose-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 h-12 px-2"
                        onClick={() => handleViewDetails({
                          ...match,
                          compatibilityScore: match.compatibility,
                          movingDate: match.moveInDate || "Flexible",
                          gender: "Any",
                          smoking: false,
                          pets: false,
                          guests: "Rarely"
                        } as any)}
                      >
                        Bio
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border-dashed border-2 border-purple-200">
              <CardContent>
                <Target className="w-16 h-16 mx-auto text-purple-300 mb-6 animate-pulse" />
                <h3 className="text-xl font-extrabold text-slate-800 mb-3">No profiles align with your strategy</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                  {filterBy === "all"
                    ? "Adjust your compatibility requirements or expand your search criteria to discover more strategic partners."
                    : "Expand your quality filter to view more potential co-occupancy profiles."}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setFilterBy("all")}>
                    Show All Matches
                  </Button>
                  <Button
                    onClick={() =>
                      (window.location.href = "/dashboard/roommate-recommendations")
                    }
                  >
                    Update Preferences
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      const { seedMockRoommates } = await import("@/utils/seedRoommates");
                      setLoading(true);
                      await seedMockRoommates();
                      window.location.reload();
                    }}
                  >
                    Generate Mock Profiles
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
