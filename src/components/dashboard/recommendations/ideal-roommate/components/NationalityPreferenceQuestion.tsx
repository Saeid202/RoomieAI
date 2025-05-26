
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface NationalityPreferenceQuestionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function NationalityPreferenceQuestion({ form }: NationalityPreferenceQuestionProps) {
  const nationalityPreference = form.watch("nationalityPreference");

  return (
    <FormField
      control={form.control}
      name="nationalityPreference"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold">2. Nationality Preference</FormLabel>
          <div className="space-y-3 mt-3">
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sameCountry" id="same-country" />
                  <FormLabel htmlFor="same-country">Same country</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="other-nationality" />
                  <FormLabel htmlFor="other-nationality">Other: specify</FormLabel>
                </div>
              </RadioGroup>
            </FormControl>
            
            {nationalityPreference === "custom" && (
              <FormField
                control={form.control}
                name="nationalityCustom"
                render={({ field }) => (
                  <FormItem className="ml-6">
                    <FormControl>
                      <Input 
                        placeholder="Please specify nationality preference..." 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
        </FormItem>
      )}
    />
  );
}
