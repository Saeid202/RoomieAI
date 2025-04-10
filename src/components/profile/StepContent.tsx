
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
    <div className="w-full h-[370px] overflow-y-auto px-2">
      <div className="w-full space-y-4 py-4">
        {step === 1 && (
          <BasicInformationSection form={form} />
        )}
        
        {step === 2 && (
          <>
            <h3 className="text-lg font-medium mb-3">Housing Preferences</h3>
            <HousingPreferencesSection form={form} />
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Lease Terms</h3>
              <LeaseTermsSection form={form} />
            </div>
          </>
        )}
        
        {step === 3 && (
          <>
            <h3 className="text-lg font-medium mb-3">Lifestyle & Habits</h3>
            <LifestyleHabitsSection 
              form={form} 
              handleHobbyToggle={handleHobbyToggle} 
              hobbiesList={hobbiesList} 
            />
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Work & Sleep Schedule</h3>
              <WorkSleepScheduleSection form={form} />
            </div>
          </>
        )}
        
        {step === 4 && (
          <>
            <h3 className="text-lg font-medium mb-3">Cleanliness & Organization</h3>
            <CleanlinessSection form={form} />
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Social Preferences</h3>
              <SocialPreferencesSection form={form} />
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Cooking & Meals</h3>
              <CookingMealsSection form={form} />
            </div>
          </>
        )}
        
        {step === 5 && (
          <RoommatePreferencesSection 
            form={form} 
            handleTraitToggle={handleTraitToggle} 
            traitsList={roommateTraitsList} 
          />
        )}
      </div>
    </div>
  );
}
