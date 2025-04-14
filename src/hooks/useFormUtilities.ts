
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";

export function useFormUtilities(form: UseFormReturn<ProfileFormValues>) {
  // Handle hobby toggle
  const handleHobbyToggle = (hobby: string) => {
    const currentHobbies = form.getValues("hobbies") || [];
    if (currentHobbies.includes(hobby)) {
      form.setValue(
        "hobbies",
        currentHobbies.filter((h) => h !== hobby)
      );
    } else {
      form.setValue("hobbies", [...currentHobbies, hobby]);
    }
  };

  // Handle trait toggle
  const handleTraitToggle = (trait: string) => {
    const currentTraits = form.getValues("importantRoommateTraits") || [];
    if (currentTraits.includes(trait)) {
      form.setValue(
        "importantRoommateTraits",
        currentTraits.filter((t) => t !== trait)
      );
    } else {
      form.setValue("importantRoommateTraits", [...currentTraits, trait]);
    }
  };

  return {
    handleHobbyToggle,
    handleTraitToggle,
  };
}
