
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

interface HouseHabitsTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function HouseHabitsTab({ form }: HouseHabitsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">House Rules & Habits 🏠</h3>
        <p className="text-muted-foreground mb-6">
          What daily habits and house rules matter most to you?
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="workSchedule"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Your Work Schedule</FormLabel>
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
                    <FormLabel htmlFor="remote">Remote work</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="office" id="office" />
                    <FormLabel htmlFor="office">Office work</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hybrid" id="hybrid" />
                    <FormLabel htmlFor="hybrid">Hybrid work</FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diet"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Dietary Preferences</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
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

        <FormField
          control={form.control}
          name="occupationPreference"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Similar Occupation</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Prefer roommate with similar profession or field
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
