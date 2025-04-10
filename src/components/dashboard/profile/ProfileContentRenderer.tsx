
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

  // For co-owner preference, show the tabbed interface
  if (userPreference === 'co-owner' || userPreference === 'both') {
    return (
      <div className="space-y-8">
        {userPreference === 'both' && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Roommate Profile</h2>
            <ProfileForm initialData={profileData} onSave={onSave} />
          </div>
        )}
        
        <div>
          {userPreference === 'both' && (
            <h2 className="text-xl font-bold mb-4">Co-Owner Profile</h2>
          )}
          
          <CoOwnerProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    );
  }

  // Default for roommate preference
  return <ProfileForm initialData={profileData} onSave={onSave} />;
}
