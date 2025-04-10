
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

  // Determine if we're on a specific profile page
  const path = window.location.pathname;
  const isRoommatePage = path.includes('/roommate');
  const isCoOwnerPage = path.includes('/co-owner');

  // Set the title based on the current page or preference
  let title = "My Profile";
  if (isRoommatePage) {
    title = "Roommate Profile";
  } else if (isCoOwnerPage) {
    title = "Co-Owner Profile";
  } else if (userPreference === 'roommate') {
    title = "Roommate Profile";
  } else if (userPreference === 'co-owner') {
    title = "Co-Owner Profile";
  }

  console.log("Path:", path);
  console.log("isRoommatePage:", isRoommatePage);
  console.log("isCoOwnerPage:", isCoOwnerPage);
  console.log("forcedView:", isRoommatePage ? 'roommate' : (isCoOwnerPage ? 'co-owner' : null));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">{title}</h1>
      
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
            forcedView={isRoommatePage ? 'roommate' : (isCoOwnerPage ? 'co-owner' : null)}
          />
        </div>
      </div>
    </div>
  );
}
