
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { saveRoommateProfile } from "@/services/roommateService";

export function useProfileSaving() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (formData: ProfileFormValues): Promise<void> => {
    if (!user) {
      console.error("No user found. Cannot save profile.");
      toast({
        title: "Authentication required",
        description: "You need to be logged in to save your profile",
        variant: "destructive",
      });
      return Promise.reject(new Error("Authentication required"));
    }
    
    try {
      setIsSaving(true);
      console.log("useProfileSaving - Saving profile data:", formData);
      
      const result = await saveRoommateProfile(user.id, formData);
      console.log("Profile saved successfully:", result);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile data. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSaveProfile
  };
}
