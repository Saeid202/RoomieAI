
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { GenderPreferenceQuestion } from "./components/GenderPreferenceQuestion";
import { NationalityPreferenceQuestion } from "./components/NationalityPreferenceQuestion";
import { LanguagePreferenceQuestion } from "./components/LanguagePreferenceQuestion";
import { DietaryPreferencesQuestion } from "./components/DietaryPreferencesQuestion";
import { OccupationPreferenceQuestion } from "./components/OccupationPreferenceQuestion";
import { WorkSchedulePreferenceQuestion } from "./components/WorkSchedulePreferenceQuestion";

interface LifestyleMatchTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function LifestyleMatchTab({ form }: LifestyleMatchTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Lifestyle Compatibility 🌟</h3>
        <p className="text-muted-foreground mb-6">
          What lifestyle factors are important for a great roommate match?
        </p>
      </div>

      <div className="space-y-8">
        <GenderPreferenceQuestion form={form} />
        <NationalityPreferenceQuestion form={form} />
        <LanguagePreferenceQuestion form={form} />
        <DietaryPreferencesQuestion form={form} />
        <OccupationPreferenceQuestion form={form} />
        <WorkSchedulePreferenceQuestion form={form} />
      </div>
    </div>
  );
}
