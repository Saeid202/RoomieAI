
import { ProfileFormValues } from "@/types/profile";
import { UserPreference } from "@/components/dashboard/types";
import { ProfileLoadingState } from "./ProfileLoadingState";
import { EmptyProfileState } from "./EmptyProfileState";
import { useViewSelector } from "./ViewSelector";
import { CoOwnerProfileView } from "./CoOwnerProfileView";

interface ProfileContentRendererProps {
  loading: boolean;
  userPreference: UserPreference;
  profileData: Partial<ProfileFormValues> | null;
  onSave: (formData: ProfileFormValues) => Promise<void>;
  navigate: (path: string) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  forcedView?: 'co-owner' | null;
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

  // Handle co-owner profile view
  if (displayView === 'co-owner' || forcedView === 'co-owner') {
    console.log("ProfileContentRenderer - Rendering Co-Owner view");
    return <CoOwnerProfileView />;
  }
  
  // Fallback to empty state if somehow no valid view was determined
  console.log("ProfileContentRenderer - No valid view found, showing empty state");
  return <EmptyProfileState />;
}
