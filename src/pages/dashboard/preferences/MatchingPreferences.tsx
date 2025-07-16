import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Settings } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useRoommateProfile } from '@/hooks/useRoommateProfile';
import { PreferenceImportanceSelector } from '@/components/dashboard/preferences/PreferenceImportanceSelector';

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

  const handlePreferencesChange = (newPreferences: typeof preferences) => {
    setPreferences(newPreferences);
  };

  const handleSavePreferences = async () => {
    await savePreferences();
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