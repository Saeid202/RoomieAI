import React, { useEffect, startTransition, useState } from "react";
import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IdealRoommateSection } from "@/components/dashboard/recommendations/IdealRoommateSection";
import { useRoommateProfile } from "@/hooks/useRoommateProfile";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { MatchesSection } from "../../components/dashboard/MatchesSection";
import { ProfileFormValues } from "@/types/profile";

export default function IdealRoommatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profileData, loading } = useRoommateProfile();
  const { handleSaveProfile } = useRoommateMatching();
  const [showMatches, setShowMatches] = useState(false);

  useEffect(() => {
    console.log("IdealRoommatePage component is rendering!");
    console.log("IdealRoommatePage - profileData:", profileData);
    console.log("IdealRoommatePage - handleSaveProfile:", !!handleSaveProfile);
    document.title = "My Ideal Roommate | Roomi AI";
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileSave = async (formData: ProfileFormValues) => {
    setShowMatches(true);
    await handleSaveProfile(formData);
  };

  const handleProfileSaved = () => {
    // This is called by MatchesSection when profile is saved
    // No additional logic needed since matches are already shown
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500">
            <Users className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Ideal Roommate</h1>
            <p className="text-gray-600">Set your preferences for the perfect roommate match</p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Roommate Preferences</CardTitle>
          <CardDescription>
            Tell us about your ideal roommate and we'll find the best matches for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IdealRoommateSection
            profileData={profileData}
            onSaveProfile={handleProfileSave}
          />
        </CardContent>
      </Card>

      {/* Matches Section */}
      <MatchesSection 
        showMatches={showMatches} 
        onProfileSaved={handleProfileSaved}
      />
    </div>
  );
}
