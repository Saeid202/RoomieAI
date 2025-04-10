
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";

export function useFormUtilities(form: UseFormReturn<ProfileFormValues>) {
  const handleHobbyToggle = (hobby: string) => {
    const current = form.getValues("hobbies");
    if (current.includes(hobby)) {
      form.setValue("hobbies", current.filter(h => h !== hobby));
    } else {
      form.setValue("hobbies", [...current, hobby]);
    }
  };
  
  const handleTraitToggle = (trait: string) => {
    const current = form.getValues("importantRoommateTraits");
    if (current.includes(trait)) {
      form.setValue("importantRoommateTraits", current.filter(t => t !== trait));
    } else {
      form.setValue("importantRoommateTraits", [...current, trait]);
    }
  };

  return {
    handleHobbyToggle,
    handleTraitToggle
  };
}
