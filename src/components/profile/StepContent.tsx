
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { BasicInformationSection } from "./BasicInformationSection";
import { HousingPreferencesSection } from "./HousingPreferencesSection";
import { LifestyleHabitsSection } from "./LifestyleHabitsSection";
import { WorkSleepScheduleSection } from "./WorkSleepScheduleSection";
import { CleanlinessSection } from "./CleanlinessSection";
import { SocialPreferencesSection } from "./SocialPreferencesSection";
import { CookingMealsSection } from "./CookingMealsSection";
import { LeaseTermsSection } from "./LeaseTermsSection";
import { RoommatePreferencesSection } from "./RoommatePreferencesSection";
import { hobbiesList, roommateTraitsList } from "@/utils/formSteps";

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
    <div className="h-full">
      {step === 1 && (
        <BasicInformationSection form={form} />
      )}
      
      {step === 2 && (
        <HousingPreferencesSection form={form} />
      )}
      
      {step === 3 && (
        <LifestyleHabitsSection 
          form={form} 
          handleHobbyToggle={handleHobbyToggle} 
          hobbiesList={hobbiesList} 
        />
      )}
      
      {step === 4 && (
        <WorkSleepScheduleSection form={form} />
      )}
      
      {step === 5 && (
        <CleanlinessSection form={form} />
      )}
      
      {step === 6 && (
        <SocialPreferencesSection form={form} />
      )}
      
      {step === 7 && (
        <CookingMealsSection form={form} />
      )}
      
      {step === 8 && (
        <LeaseTermsSection form={form} />
      )}
      
      {step === 9 && (
        <RoommatePreferencesSection 
          form={form} 
          handleTraitToggle={handleTraitToggle} 
          traitsList={roommateTraitsList} 
        />
      )}
    </div>
  );
}
