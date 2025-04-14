
import { ProfileFormValues } from "@/types/profile";
import React from "react";

interface ProfileSaveHandlerProps {
  isSubmitting: boolean;
  onSubmit: (formData: ProfileFormValues) => Promise<void>;
  children: React.ReactNode;
}

export function ProfileSaveHandler({ 
  isSubmitting, 
  onSubmit, 
  children 
}: ProfileSaveHandlerProps) {
  return (
    <div>
      {children}
    </div>
  );
}
