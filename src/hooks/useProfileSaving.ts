
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { saveRoommateProfile } from "@/services/roommateService";

export function useProfileSaving() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSaveProfile = async (formData: ProfileFormValues): Promise<void> => {
    if (!user) {
      const authError = new Error("Authentication required");
      console.error("No user found. Cannot save profile.");
      setError(authError);
      
      toast({
        title: "Authentication required",
        description: "You need to be logged in to save your profile",
        variant: "destructive",
      });
      
      throw authError;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      console.log("useProfileSaving - Starting save process");
      console.log("useProfileSaving - User ID:", user.id);
      console.log("useProfileSaving - Form data:", formData);
      
      // Save to roommate table
      const result = await saveRoommateProfile(user.id, formData);
      console.log("useProfileSaving - Profile saved successfully:", result);
      
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });
      
      // Return void as expected
      return Promise.resolve();
    } catch (err) {
      console.error("Error saving profile:", err);
      const saveError = err instanceof Error ? err : new Error("Failed to save profile");
      setError(saveError);
      
      // Show more specific error message if available
      const errorMessage = saveError.message || "Failed to save profile data. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  };

  const resetError = () => {
    setError(null);
  };

  return {
    isSaving,
    error,
    handleSaveProfile,
    resetError
  };
}
