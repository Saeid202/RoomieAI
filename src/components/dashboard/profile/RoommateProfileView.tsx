
import ProfileForm from "@/components/ProfileForm";
import { ProfileFormValues } from "@/types/profile";

interface RoommateProfileViewProps {
  profileData: Partial<ProfileFormValues> | null;
  onSave: (formData: ProfileFormValues) => Promise<void>;
}

export function RoommateProfileView({ profileData, onSave }: RoommateProfileViewProps) {
  console.log("Rendering roommate form");
  return <ProfileForm initialData={profileData} onSave={onSave} />;
}
