
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WorkSchedulePreferenceQuestionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function WorkSchedulePreferenceQuestion({ form }: WorkSchedulePreferenceQuestionProps) {
  return (
    <FormField
      control={form.control}
      name="workSchedulePreference"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-base font-semibold">6. Do you have a work schedule preference for your roommate?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-col space-y-2 mt-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dayShift" id="day-shift-pref" />
                <FormLabel htmlFor="day-shift-pref">Yes, I'm looking for a roommate with Day shift</FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nightShift" id="night-shift-pref" />
                <FormLabel htmlFor="night-shift-pref">I'm looking for a roommate with Night shift</FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overnightShift" id="overnight-shift-pref" />
                <FormLabel htmlFor="overnight-shift-pref">I'm looking for a roommate with Overnight shift</FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="noPreference" id="no-pref" />
                <FormLabel htmlFor="no-pref">No Preference</FormLabel>
              </div>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
