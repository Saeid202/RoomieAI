
import { useProfileData } from "@/hooks/useProfileData";
import { ProfileContentRenderer } from "@/components/dashboard/profile/ProfileContentRenderer";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

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

  const location = useLocation();
  const path = location.pathname;
  
  // Determine if we're on a specific profile page
  const isCoOwnerPage = path.includes('/profile/co-owner');
  const isRoommatePage = path.includes('/profile/roommate');

  // Log the current path and view for debugging
  useEffect(() => {
    console.log("ProfileContent - Current path:", path);
    console.log("ProfileContent - Is co-owner page:", isCoOwnerPage);
    console.log("ProfileContent - Is roommate page:", isRoommatePage);
    console.log("ProfileContent - User preference:", userPreference);
    console.log("ProfileContent - Profile data:", profileData);
  }, [path, isCoOwnerPage, isRoommatePage, userPreference, profileData]);

  // Set the title based on the current page or preference
  let title = "My Profile";
  if (isCoOwnerPage) {
    title = "Co-Owner Profile";
  } else if (isRoommatePage) {
    title = "Roommate Profile";
  } else if (userPreference === 'co-owner') {
    title = "Co-Owner Profile";
  }

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
            forcedView={isCoOwnerPage ? 'co-owner' : isRoommatePage ? 'roommate' : null}
          />
        </div>
      </div>
    </div>
  );
}
