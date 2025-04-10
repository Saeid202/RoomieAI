
import ProfileForm from "@/components/ProfileForm";
import { ProfileFormValues } from "@/types/profile";
import { UserPreference } from "@/components/dashboard/types";
import { CoOwnerProfileTabs } from "@/components/dashboard/co-owner/CoOwnerProfileTabs";
import { ProfileLoadingState } from "./ProfileLoadingState";
import { EmptyProfileState } from "./EmptyProfileState";

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
  if (loading) {
    return <ProfileLoadingState />;
  }

  if (!userPreference && !forcedView) {
    return <EmptyProfileState />;
  }

  console.log("ProfileContentRenderer - forcedView:", forcedView);
  
  // If forcedView is provided, it overrides everything else
  if (forcedView === 'roommate') {
    console.log("Rendering roommate form based on forcedView");
    return <ProfileForm initialData={profileData} onSave={onSave} />;
  }

  if (forcedView === 'co-owner') {
    console.log("Rendering co-owner tabs based on forcedView");
    return <CoOwnerProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  // If no forcedView, use userPreference
  if (userPreference === 'roommate') {
    console.log("Rendering roommate form based on userPreference");
    return <ProfileForm initialData={profileData} onSave={onSave} />;
  }

  if (userPreference === 'co-owner') {
    console.log("Rendering co-owner tabs based on userPreference");
    return <CoOwnerProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  // For users with 'both' preference, show the roommate form by default
  if (userPreference === 'both') {
    console.log("User has 'both' preference, defaulting to roommate form");
    return <ProfileForm initialData={profileData} onSave={onSave} />;
  }

  // Fallback to roommate form as default
  console.log("Fallback to roommate form");
  return <ProfileForm initialData={profileData} onSave={onSave} />;
}
