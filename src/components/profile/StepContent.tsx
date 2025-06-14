
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { BasicInformationSection } from "./BasicInformationSection";
import { HousingPreferencesSection } from "./HousingPreferencesSection";
import { IdealRoommateForm } from "@/components/dashboard/recommendations/ideal-roommate/IdealRoommateForm";

interface StepContentProps {
  form: UseFormReturn<ProfileFormValues>;
  step: number;
  handleHobbyToggle: (hobby: string) => void;
  handleTraitToggle: (trait: string) => void;
}

export function StepContent({ 
  form, 
  step, 
  handleHobbyToggle, 
  handleTraitToggle 
}: StepContentProps) {
  return (
    <div className="w-full px-2">
      {step === 1 && (
        <div className="w-full space-y-4 py-4">
          <BasicInformationSection form={form} />
        </div>
      )}
      
      {step === 2 && (
        <div className="w-full space-y-4 py-4">
          <HousingPreferencesSection form={form} />
        </div>
      )}
      
      {step === 3 && (
        <div className="w-full space-y-4 py-4">
          <IdealRoommateForm 
            form={form} 
            onSubmit={async () => {}} 
            isSaving={false}
          />
        </div>
      )}
    </div>
  );
}
