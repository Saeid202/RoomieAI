
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
      toast({
        title: "Authentication required",
        description: "Please sign in to save your profile",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      setIsSaving(true);
      console.log("Saving profile data:", formData);
      
      // Call the service function to save to the database
      await saveRoommateProfile(user.id, formData);
      
      console.log("Profile saved successfully");
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });
      
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSaveProfile,
  };
}
