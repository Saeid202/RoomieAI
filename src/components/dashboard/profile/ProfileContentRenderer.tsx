
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

  if (!userPreference) {
    return <EmptyProfileState />;
  }

  // If forcedView is provided, it overrides everything else
  if (forcedView === 'roommate') {
    return <ProfileForm initialData={profileData} onSave={onSave} />;
  }

  if (forcedView === 'co-owner') {
    return <CoOwnerProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  // If no forcedView, use userPreference
  if (userPreference === 'roommate') {
    return <ProfileForm initialData={profileData} onSave={onSave} />;
  }

  if (userPreference === 'co-owner') {
    return <CoOwnerProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  // For users with 'both' preference, handle based on current URL path
  if (userPreference === 'both') {
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
