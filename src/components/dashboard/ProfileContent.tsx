
import { useProfileData } from "@/hooks/useProfileData";
import { ProfileContentRenderer } from "@/components/dashboard/profile/ProfileContentRenderer";

export function ProfileContent() {
  const { 
    profileData, 
    loading, 
    userPreference, 
    navigate, 
    activeTab, 
    setActiveTab, 
    handleSaveProfile 
  } = useProfileData();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">My Profile</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <ProfileContentRenderer 
            loading={loading}
            userPreference={userPreference}
            profileData={profileData}
            onSave={handleSaveProfile}
            navigate={navigate}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}
