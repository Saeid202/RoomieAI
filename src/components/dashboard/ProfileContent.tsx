
import { useProfileData } from "@/hooks/useProfileData";
import { ProfileContentRenderer } from "@/components/dashboard/profile/ProfileContentRenderer";
import { useLocation } from "react-router-dom";

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

  // Set the title based on the current page or preference
  let title = "My Profile";
  if (isCoOwnerPage) {
    title = "Co-Owner Profile";
  } else if (userPreference === 'co-owner') {
    title = "Co-Owner Profile";
  }

  // Log the current path and forced view for debugging
  console.log("Current path:", path);
  console.log("Is co-owner page:", isCoOwnerPage);
  console.log("User preference:", userPreference);

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
            forcedView={isCoOwnerPage ? 'co-owner' : null}
          />
        </div>
      </div>
    </div>
  );
}
