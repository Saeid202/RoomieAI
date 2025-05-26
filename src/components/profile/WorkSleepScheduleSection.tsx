
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WorkSleepScheduleSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function WorkSleepScheduleSection({ form }: WorkSleepScheduleSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Work & Schedule</h3>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="workLocation"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Work Location</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remote" id="remote" />
                    <FormLabel htmlFor="remote">Remote</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="office" id="office" />
                    <FormLabel htmlFor="office">Office</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hybrid" id="hybrid" />
                    <FormLabel htmlFor="hybrid">Hybrid</FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workSchedule"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Work Schedule</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dayShift" id="day-shift" />
                    <FormLabel htmlFor="day-shift">Day shift (9 AM - 5 PM)</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="afternoonShift" id="afternoon-shift" />
                    <FormLabel htmlFor="afternoon-shift">Afternoon shift (1 PM - 9 PM)</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overnightShift" id="overnight-shift" />
                    <FormLabel htmlFor="overnight-shift">Overnight shift (11 PM - 7 AM)</FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
