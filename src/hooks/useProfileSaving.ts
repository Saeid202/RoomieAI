
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { saveRoommateProfile } from "@/services/roommateService";

export function useProfileSaving() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (formData: ProfileFormValues) => {
    try {
      if (!user) {
        console.error("No user found. Cannot save profile.");
        toast({
          title: "Authentication required",
          description: "You need to be logged in to save your profile",
          variant: "destructive",
        });
        return false;
      }
      
      setIsSaving(true);
      console.log("Saving profile data:", formData);
      
      await saveRoommateProfile(user.id, formData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile data. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSaveProfile
  };
}
