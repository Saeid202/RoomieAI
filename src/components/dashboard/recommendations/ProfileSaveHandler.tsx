
import { ProfileFormValues } from "@/types/profile";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProfileSaveHandlerProps {
  isSubmitting: boolean;
  onSubmit: (formData: ProfileFormValues) => Promise<void>;
  children: React.ReactNode | ((onSaveProfile: (formData: ProfileFormValues) => Promise<void>) => React.ReactNode);
}

export function ProfileSaveHandler({ 
  isSubmitting, 
  onSubmit, 
  children 
}: ProfileSaveHandlerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveProfile = async (formData: ProfileFormValues): Promise<void> => {
    if (isSaving || isSubmitting) {
      console.log("Already saving profile, skipping duplicate request");
      return Promise.resolve();
    }
    
    try {
      setIsSaving(true);
      console.log("ProfileSaveHandler - Saving profile data:", formData);
      await onSubmit(formData);
      
      toast({
        title: "Profile saved",
        description: "Your profile has been saved successfully",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error in ProfileSaveHandler:", error);
      toast({
        title: "Error saving profile",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {typeof children === 'function' 
        ? children(handleSaveProfile) 
        : children}
    </div>
  );
}
