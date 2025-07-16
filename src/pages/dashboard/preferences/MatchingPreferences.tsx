import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Settings } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useRoommateProfile } from '@/hooks/useRoommateProfile';
import { PreferenceImportanceSelector } from '@/components/dashboard/preferences/PreferenceImportanceSelector';
import { customPreferenceMatchingEngine } from '@/services/customPreferenceMatchingService';
import { MatchResult } from '@/utils/matchingAlgorithm/types';
import { RoommateCard } from '@/components/dashboard/recommendations/RoommateCard';

export default function MatchingPreferences() {
  const {
    preferences,
    setPreferences,
    loading: preferencesLoading,
    saving: preferencesSaving,
    savePreferences
  } = useUserPreferences();

  const {
    profileData,
    loading: profileLoading
  } = useRoommateProfile();

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

  const handlePreferencesChange = (newPreferences: typeof preferences) => {
    setPreferences(newPreferences);
  };

  const handleSavePreferences = async () => {
    await savePreferences();
  };

  const findCustomMatches = async () => {
    if (!profileData) {
      console.error('Profile data not available');
      return;
    }

    setIsSearching(true);
    try {
      const customResults = await customPreferenceMatchingEngine.findMatches({
        currentUser: profileData,
        userPreferences: preferences,
        maxResults: 10,
        minScore: 50
      });

      const matchResults = customResults.map(result => 
        customPreferenceMatchingEngine.convertToMatchResult(result)
      );

      setMatches(matchResults);
    } catch (error) {
      console.error('Error finding custom matches:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewDetails = (match: MatchResult) => {
    setSelectedMatch(match);
  };

  const handleCloseDetails = () => {
    setSelectedMatch(null);
  };

  if (preferencesLoading || profileLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedMatch) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-4">
          <Button variant="outline" onClick={handleCloseDetails}>
            ← Back to Preferences
          </Button>
        </div>
        {/* Match detail view can be implemented here */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedMatch.name}</CardTitle>
            <CardDescription>Match Score: {selectedMatch.compatibilityScore}%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Basic Information</h4>
                <p>Age: {selectedMatch.age}</p>
                <p>Gender: {selectedMatch.gender}</p>
                <p>Location: {selectedMatch.location}</p>
                <p>Budget: ${selectedMatch.budget[0]} - ${selectedMatch.budget[1]}</p>
              </div>
              <div>
                <h4 className="font-medium">Lifestyle</h4>
                <p>Smoking: {selectedMatch.smoking ? 'Yes' : 'No'}</p>
                <p>Pets: {selectedMatch.pets ? 'Yes' : 'No'}</p>
                <p>Work Schedule: {selectedMatch.workSchedule}</p>
              </div>
              <div>
                <h4 className="font-medium">Interests</h4>
                <p>{selectedMatch.interests.join(', ') || 'None listed'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matching Preferences</h1>
          <p className="text-muted-foreground">
            Customize how we find your perfect roommate matches
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Preference Selector */}
      <PreferenceImportanceSelector
        preferences={preferences}
        onPreferencesChange={handlePreferencesChange}
        onSave={handleSavePreferences}
      />

      <Separator />

      {/* Find Matches Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Matches with Your Custom Preferences
          </CardTitle>
          <CardDescription>
            Use your customized preferences to find roommates that match your exact criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={findCustomMatches}
              disabled={isSearching || !profileData}
              className="min-w-[140px]"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Matches
                </>
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {matches.length > 0 && `Found ${matches.length} matches`}
            </div>
          </div>

          {/* Matches Results */}
          {isSearching && (
            <div className="mt-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Finding your perfect matches...</p>
                </div>
              </div>
            </div>
          )}

          {!isSearching && matches.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Your Custom Matches</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match, index) => (
                  <RoommateCard
                    key={index}
                    match={match}
                    onViewDetails={() => handleViewDetails(match)}
                  />
                ))}
              </div>
            </div>
          )}

          {!isSearching && matches.length === 0 && (
            <div className="mt-6">
              <div className="text-center py-8">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your preferences or reducing the importance of some criteria
                </p>
                <Button variant="outline" onClick={findCustomMatches}>
                  Search Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Must Have (Required)</p>
              <p className="text-sm text-muted-foreground">
                Use sparingly for absolute deal-breakers like location or smoking
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-orange-900">Important</p>
              <p className="text-sm text-muted-foreground">
                For preferences that matter but have some flexibility
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Not Important</p>
              <p className="text-sm text-muted-foreground">
                For nice-to-haves that won't make or break a match
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 