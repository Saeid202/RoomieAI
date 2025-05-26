
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { HousingPreferencesSection } from "@/components/profile/HousingPreferencesSection";

interface HousingTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function HousingTab({ form }: HousingTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Home Sweet Home? 🏠</h3>
      <p className="text-muted-foreground">Tell us about your dream pad! Mansion or shoebox, we don't judge (much). 😉</p>
      <HousingPreferencesSection form={form} />
    </div>
  );
}
