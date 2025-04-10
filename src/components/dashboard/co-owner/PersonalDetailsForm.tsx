
import { CoOwnerProfileForm } from "./CoOwnerProfileForm";
import { CoOwnerProfileLoading } from "./CoOwnerProfileLoading";
import { useCoOwnerProfile } from "@/hooks/useCoOwnerProfile";

export function PersonalDetailsForm() {
  const { profileData, loading, saveProfile } = useCoOwnerProfile();

  if (loading) {
    return <CoOwnerProfileLoading />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CoOwnerProfileForm 
        initialData={profileData} 
        onSave={saveProfile} 
      />
    </div>
  );
}
