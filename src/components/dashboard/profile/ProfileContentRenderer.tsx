
import { ProfileFormValues } from "@/types/profile";
import { UserPreference } from "@/components/dashboard/types";
import { ProfileLoadingState } from "./ProfileLoadingState";
import { EmptyProfileState } from "./EmptyProfileState";
import { useViewSelector } from "./ViewSelector";
import { RoommateProfileView } from "./RoommateProfileView";
import { CoOwnerProfileView } from "./CoOwnerProfileView";

interface ProfileContentRendererProps {
  loading: boolean;
  userPreference: UserPreference;
  profileData: Partial<ProfileFormValues> | null;
  onSave: (formData: ProfileFormValues) => Promise<void>;
  navigate: (path: string) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  forcedView?: 'roommate' | 'co-owner' | null;
}

export function ProfileContentRenderer({ 
  loading, 
  userPreference, 
  profileData, 
  onSave,
  navigate,
  activeTab,
  setActiveTab,
  forcedView = null
}: ProfileContentRendererProps) {
  // Use the view selector hook to determine which view to display
  const { displayView } = useViewSelector({ 
    userPreference, 
    forcedView 
  });

  if (loading) {
    return <ProfileLoadingState />;
  }

  // If no preference or forced view, show empty state
  if (!displayView) {
    return <EmptyProfileState />;
  }
  
  // Render the appropriate view based on the selected preference
  if (displayView === 'roommate') {
    return <RoommateProfileView profileData={profileData} onSave={onSave} />;
  }

  if (displayView === 'co-owner') {
    return <CoOwnerProfileView />;
  }

  // Fallback to profile selection if no valid preference is found
  console.log("No valid preference found, showing empty state");
  return <EmptyProfileState />;
}
