
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
      throw new Error("Authentication required");
    }
    
    setIsSaving(true);
    
    try {
      console.log("useProfileSaving - Starting save process");
      console.log("useProfileSaving - User ID:", user.id);
      console.log("useProfileSaving - Form data:", formData);
      
      const result = await saveRoommateProfile(user.id, formData);
      console.log("useProfileSaving - Profile saved successfully:", result);
      
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
      throw error; // Re-throw the error to propagate it
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSaveProfile
  };
}
