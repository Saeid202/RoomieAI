
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { RoommatePreferencesSection } from "@/components/profile/RoommatePreferencesSection";
import { roommateTraitsList } from "@/utils/formSteps";

interface PreferencesTabProps {
  form: UseFormReturn<ProfileFormValues>;
  handleTraitToggle: (trait: string) => void;
}

export function PreferencesTab({ form, handleTraitToggle }: PreferencesTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Your Dream Roomie! 🌈</h3>
      <p className="text-muted-foreground">Seeking a neat freak? A fellow pizza enthusiast? A plant parent? Let's find your perfect match! 🔍</p>
      <RoommatePreferencesSection 
        form={form} 
        handleTraitToggle={handleTraitToggle} 
        traitsList={roommateTraitsList} 
      />
    </div>
  );
}
