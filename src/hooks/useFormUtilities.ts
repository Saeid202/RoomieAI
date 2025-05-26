
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

  // Handle roommate hobbies toggle (using the correct field name)
  const handleTraitToggle = (trait: string) => {
    const currentTraits = form.getValues("roommateHobbies") || [];
    if (currentTraits.includes(trait)) {
      form.setValue(
        "roommateHobbies",
        currentTraits.filter((t) => t !== trait)
      );
    } else {
      form.setValue("roommateHobbies", [...currentTraits, trait]);
    }
  };

  return {
    handleHobbyToggle,
    handleTraitToggle,
  };
}
