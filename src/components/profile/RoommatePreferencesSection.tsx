
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

interface RoommatePreferencesSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  handleTraitToggle: (trait: string) => void;
  traitsList: string[];
}

export function RoommatePreferencesSection({ 
  form, 
  handleTraitToggle, 
  traitsList 
}: RoommatePreferencesSectionProps) {
  const selectedTraits = form.watch("roommateHobbies") || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Roommate Preferences</h3>
        <p className="text-muted-foreground">
          What qualities would you like in your ideal roommate?
        </p>
      </div>

      <div>
        <FormLabel className="text-base mb-4 block">Desired Roommate Qualities</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {traitsList.map((trait) => (
            <Badge
              key={trait}
              variant={selectedTraits.includes(trait) ? "default" : "outline"}
              className="cursor-pointer text-center py-2"
              onClick={() => handleTraitToggle(trait)}
            >
              {trait}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
