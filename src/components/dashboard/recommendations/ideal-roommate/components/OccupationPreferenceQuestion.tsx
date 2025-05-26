
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface OccupationPreferenceQuestionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function OccupationPreferenceQuestion({ form }: OccupationPreferenceQuestionProps) {
  return (
    <FormField
      control={form.control}
      name="occupationPreference"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-base font-semibold">5. Do you have an occupation preference for your roommate?</FormLabel>
          <div className="space-y-3 mt-3">
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "yes")}
                value={field.value ? "yes" : "no"}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="occ-yes" />
                  <FormLabel htmlFor="occ-yes">Yes (please specify)</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="occ-no" />
                  <FormLabel htmlFor="occ-no">No</FormLabel>
                </div>
              </RadioGroup>
            </FormControl>
            
            {field.value && (
              <FormField
                control={form.control}
                name="occupationSpecific"
                render={({ field }) => (
                  <FormItem className="ml-6">
                    <FormControl>
                      <Input 
                        placeholder="Please specify occupation preference..." 
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
