
import ProfileForm from "@/components/ProfileForm";
import { ProfileFormValues } from "@/types/profile";
import { UserPreference } from "@/components/dashboard/types";
import { CoOwnerProfileTabs } from "@/components/dashboard/co-owner/CoOwnerProfileTabs";
import { ProfileLoadingState } from "./ProfileLoadingState";
import { EmptyProfileState } from "./EmptyProfileState";
import { useLocation } from "react-router-dom";
import { PersonalDetailsForm } from "@/components/dashboard/co-owner/PersonalDetailsForm";

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
  const location = useLocation();
  const path = location.pathname;

  // Check if we're on a specific profile route
  const isRoommatePage = path.includes('/profile/roommate');
  const isCoOwnerPage = path.includes('/profile/co-owner');
  
  // Route-based view takes precedence over forcedView and userPreference
  const displayView = isRoommatePage 
    ? 'roommate' 
    : isCoOwnerPage 
      ? 'co-owner' 
      : forcedView || userPreference;

  // Add debugging logs
  console.log("ProfileContentRenderer - path:", path);
  console.log("ProfileContentRenderer - isRoommatePage:", isRoommatePage);
  console.log("ProfileContentRenderer - isCoOwnerPage:", isCoOwnerPage);
  console.log("ProfileContentRenderer - forcedView:", forcedView);
  console.log("ProfileContentRenderer - userPreference:", userPreference);
  console.log("ProfileContentRenderer - displayView:", displayView);

  if (loading) {
    return <ProfileLoadingState />;
  }

  // If no preference or forced view, show empty state
  if (!displayView) {
    return <EmptyProfileState />;
  }
  
  if (displayView === 'roommate') {
    console.log("Rendering roommate form based on displayView");
    return <ProfileForm initialData={profileData} onSave={onSave} />;
  }

  if (displayView === 'co-owner') {
    console.log("Rendering co-owner form based on displayView");
    // Use the direct PersonalDetailsForm component that includes the co-owner form
    return <PersonalDetailsForm />;
  }

  // Fallback to profile selection if no valid preference is found
  console.log("No valid preference found, showing empty state");
  return <EmptyProfileState />;
}
