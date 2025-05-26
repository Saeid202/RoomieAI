
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { BasicInformationSection } from "./BasicInformationSection";
import { HousingPreferencesSection } from "./HousingPreferencesSection";
import { IdealRoommateForm } from "@/components/dashboard/recommendations/ideal-roommate/IdealRoommateForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeHousingTab, setActiveHousingTab] = useState("housing");

  return (
    <div className="w-full h-[420px] overflow-y-auto px-2">
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
            onSubmit={() => {}} 
            isSaving={false}
          />
        </div>
      )}
    </div>
  );
}
