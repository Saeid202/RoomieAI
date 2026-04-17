import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Filter, SortDesc } from "lucide-react";
import { MatchCard } from "./MatchCard";
import { idealRoommateMatchingEngine } from "@/services/idealRoommateMatchingService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRoommateProfile } from "@/hooks/useRoommateProfile";
import { MatchResult } from "@/utils/matchingAlgorithm/types";

interface Match {
  id: string;
  userId?: string;
  name: string;
  age: string;
  gender: string;
  occupation: string;
  location: string;
  profileImage?: string;
  compatibilityScore?: number;
  isAlgorithmMatch: boolean;
  isOnline: boolean;
  lastActive: Date;
  bio?: string;
  smoking: boolean;
  hasPets: boolean;
  workSchedule: string;
  cleanliness: number;
}

interface FilterOptions {
  ageRange: [number, number];
  minCompatibility: number;
  showOnlineOnly: boolean;
  searchQuery: string;
}

interface MatchesSectionProps {
  showMatches: boolean;
  onProfileSaved?: () => void;
}

export function MatchesSection({ showMatches, onProfileSaved }: MatchesSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profileData, loading } = useRoommateProfile();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    ageRange: [18, 65],
    minCompatibility: 0,
    showOnlineOnly: false,
    searchQuery: ""
  });

  const memoizedFilters = useMemo(() => filters, [filters.ageRange, filters.minCompatibility, filters.showOnlineOnly, filters.searchQuery]);

  useEffect(() => {
    if (showMatches && profileData && !loading) {
      loadMatches();
    }
  }, [showMatches, profileData, loading, filters.ageRange, filters.minCompatibility, filters.showOnlineOnly, filters.searchQuery]);

  useEffect(() => {
    // This effect is not needed - onProfileSaved is handled by the parent component
  }, []);

  const loadMatches = async () => {
    if (!profileData || loading) {
      return;
    }

    try {
      setMatchesLoading(true);

      // Get algorithm matches
      const algorithmMatches = await idealRoommateMatchingEngine.findMatches({
        currentUser: profileData,
        currentUserId: user?.id,
        maxResults: 20,
        minScore: filters.minCompatibility || 30,
      });

      // Get existing users from mock data
      const { getMockRoommates } = await import("@/utils/matchingAlgorithm/mockData");
      const mockUsers = await getMockRoommates();

      // Convert algorithm matches to Match format
      const algorithmMatchesFormatted: Match[] = algorithmMatches.map((match, index) => ({
        id: `algorithm-${index}`,
        userId: match.user?.id || match.user?.user_id,
        name: match.user?.full_name || `User ${index + 1}`,
        age: match.user?.age?.toString() || "25",
        gender: match.user?.gender || "Not specified",
        occupation: match.user?.work_location || "Not specified",
        location: Array.isArray(match.user?.preferred_location) ? match.user.preferred_location[0] : match.user?.preferred_location || "Toronto, ON",
        profileImage: undefined,
        compatibilityScore: match.matchScore,
        isAlgorithmMatch: true,
        isOnline: Math.random() > 0.5,
        lastActive: new Date(),
        bio: `${match.user?.work_location || 'Professional'} interested in ${match.user?.hobbies?.slice(0, 2).join(' and ') || 'hobbies'}.`,
        smoking: match.user?.smoking || false,
        hasPets: match.user?.has_pets || false,
        workSchedule: match.user?.work_schedule || "Not specified",
        cleanliness: 5, // Default value
      }));

      // Convert existing users to Match format  
      const existingUsersFormatted: Match[] = mockUsers.map((user, index) => ({
        id: `existing-user-${index}`,
        userId: user.userId || index.toString(),
        name: user.name,
        age: user.age?.toString() || "25",
        gender: user.gender || "Not specified",
        occupation: user.occupation || "Not specified",
        location: user.location || "Toronto, ON",
        profileImage: undefined,
        compatibilityScore: Math.floor(Math.random() * 40) + 60, // Random compatibility for existing users
        isAlgorithmMatch: false,
        isOnline: Math.random() > 0.7,
        lastActive: new Date(),
        bio: `${user.occupation || 'Professional'} looking for ${user.traits?.join(', ') || 'roommates'}. Enjoys ${user.interests?.slice(0, 2).join(' and ') || 'hiking and coding'}.`,
        smoking: user.smoking || false,
        hasPets: user.pets || false,
        workSchedule: user.workSchedule || "Not specified",
        cleanliness: user.cleanliness || 5,
      }));

      // Combine both algorithm matches and existing users
      const allMatches = [...algorithmMatchesFormatted, ...existingUsersFormatted];

      // Apply filters
      const filteredMatches = allMatches.filter(match => {
        const ageNum = parseInt(match.age) || 0;
        const ageMatch = ageNum >= filters.ageRange[0] && ageNum <= filters.ageRange[1];
        const compatibilityMatch = !filters.minCompatibility || 
          (match.compatibilityScore && match.compatibilityScore >= filters.minCompatibility);
        const onlineMatch = !filters.showOnlineOnly || match.isOnline;
        const searchMatch = !filters.searchQuery || 
          match.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          match.location.toLowerCase().includes(filters.searchQuery.toLowerCase());

        return ageMatch && compatibilityMatch && onlineMatch && searchMatch;
      });

      // Sort by compatibility score (algorithm matches first, then by compatibility)
      filteredMatches.sort((a, b) => {
        if (a.isAlgorithmMatch && !b.isAlgorithmMatch) return -1;
        if (!a.isAlgorithmMatch && b.isAlgorithmMatch) return 1;
        if (a.isAlgorithmMatch && b.isAlgorithmMatch) return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
        return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
      });

      setMatches(filteredMatches);
      
      toast({
        title: "Matches Found!",
        description: `Found ${filteredMatches.length} potential roommates (${algorithmMatchesFormatted.length} from your preferences + ${existingUsersFormatted.length} existing users).`,
      });
    } catch (error) {
      console.error("Error loading matches:", error);
      toast({
        title: "Error",
        description: "Failed to load matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleMessage = (matchId: string) => {
    // Navigate to messenger with user
    window.location.href = `/dashboard/chats?user=${matchId}`;
  };

  const viewProfile = (userId: string) => {
    window.location.href = `/dashboard/user/${userId}`;
  };

  if (!showMatches) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Potential Roommates</h2>
          <p className="text-gray-600">
            {matches.length} potential {matches.length === 1 ? "roommate" : "roommates"} found
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setFilters({
              ageRange: [18, 65],
              minCompatibility: 0,
              showOnlineOnly: false,
              searchQuery: ""
            })}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Age Range</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="18"
                max="65"
                value={filters.ageRange[0]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  ageRange: [parseInt(e.target.value), prev.ageRange[1]]
                }))}
                className="w-20 px-3 py-2 border rounded"
              />
              <span>to</span>
              <input
                type="number"
                min="18"
                max="65"
                value={filters.ageRange[1]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  ageRange: [prev.ageRange[0], parseInt(e.target.value)]
                }))}
                className="w-20 px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Minimum Compatibility</label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.minCompatibility}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                minCompatibility: parseInt(e.target.value)
              }))}
              className="w-32 px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showOnlineOnly}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  showOnlineOnly: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm font-medium">Show online only</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                searchQuery: e.target.value
              }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {matchesLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Finding your perfect roommates...</p>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      {!loading && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onMessage={handleMessage}
              onViewProfile={viewProfile}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && matches.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">No matches found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Try adjusting your preferences or expand your search criteria to discover more potential roommates.
            </p>
            <Button onClick={() => setFilters({
              ageRange: [18, 65],
              minCompatibility: 0,
              showOnlineOnly: false,
              searchQuery: ""
            })}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
