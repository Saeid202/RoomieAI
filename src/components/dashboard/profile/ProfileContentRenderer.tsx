
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
}

export function ProfileContentRenderer({ 
  loading, 
  userPreference, 
  profileData, 
  onSave,
  navigate,
  activeTab,
  setActiveTab
}: ProfileContentRendererProps) {
  if (loading) {
    return <ProfileLoadingState />;
  }

  if (!userPreference) {
    return <EmptyProfileState />;
  }

  // Show only the roommate form for roommate preference
  if (userPreference === 'roommate') {
    return <ProfileForm initialData={profileData} onSave={onSave} />;
  }

  // Show only the co-owner form for co-owner preference
  if (userPreference === 'co-owner') {
    return <CoOwnerProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  // For users with 'both' preference, show appropriate form based on the current path
  // This can be enhanced later with tabs to switch between the two forms
  if (userPreference === 'both') {
    // Determine which page we're on from the URL
    const path = window.location.pathname;
    if (path.includes('roommate')) {
      return <ProfileForm initialData={profileData} onSave={onSave} />;
    } else if (path.includes('co-owner')) {
      return <CoOwnerProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />;
    } else {
      // Default to roommate form if path doesn't indicate preference
      return <ProfileForm initialData={profileData} onSave={onSave} />;
    }
  }

  // Fallback to roommate form as default
  return <ProfileForm initialData={profileData} onSave={onSave} />;
}
