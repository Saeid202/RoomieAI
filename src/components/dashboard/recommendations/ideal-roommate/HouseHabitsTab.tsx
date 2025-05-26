
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
              <FormLabel>Preferred Work Schedule Match</FormLabel>
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
