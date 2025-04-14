
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { useAuth } from "@/hooks/useAuth";

interface ProfileSaveHandlerProps {
  handleSaveProfile: (formData: ProfileFormValues) => Promise<void>;
  loadProfileData: () => Promise<void>;
  children: (onSaveProfile: (formData: ProfileFormValues) => Promise<void>) => React.ReactNode;
}

export function ProfileSaveHandler({ 
  handleSaveProfile, 
  loadProfileData, 
  children 
}: ProfileSaveHandlerProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const onHandleSaveProfile = async (formData: ProfileFormValues) => {
    try {
      console.log("Saving profile from RoommateRecommendations:", formData);
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to save your profile",
          variant: "destructive",
        });
        return;
      }
      
      await handleSaveProfile(formData);
      
      await loadProfileData();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return <>{children(onHandleSaveProfile)}</>;
}
