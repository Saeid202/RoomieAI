
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DietaryPreferencesQuestionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function DietaryPreferencesQuestion({ form }: DietaryPreferencesQuestionProps) {
  return (
    <FormField
      control={form.control}
      name="diet"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-base font-semibold">4. Dietary Preferences</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-col space-y-2 mt-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="noRestrictions" id="no-restrictions" />
                <FormLabel htmlFor="no-restrictions">No dietary restrictions</FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vegetarian" id="vegetarian" />
                <FormLabel htmlFor="vegetarian">Vegetarian</FormLabel>
              </div>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
