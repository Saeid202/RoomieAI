import { useFormContext } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function OccupationLifestyleStep() {
  const form = useFormContext<ProfileFormValues>();
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="occupation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Occupation</FormLabel>
            <FormControl>
              <Input placeholder="Enter your occupation" {...field} />
            </FormControl>
            <FormMessage />
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
              <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="remote" />
                  </FormControl>
                  <FormLabel className="font-normal">Work from home</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="office" />
                  </FormControl>
                  <FormLabel className="font-normal">Go to office</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="hybrid" />
                  </FormControl>
                  <FormLabel className="font-normal">Hybrid (both)</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
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
              <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="dayShift" />
                  </FormControl>
                  <FormLabel className="font-normal">Day shift</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="afternoonShift" />
                  </FormControl>
                  <FormLabel className="font-normal">Afternoon shift</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="overnightShift" />
                  </FormControl>
                  <FormLabel className="font-normal">Overnight shift</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
