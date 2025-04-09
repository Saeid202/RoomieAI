
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";

interface WorkSleepScheduleSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function WorkSleepScheduleSection({ form }: WorkSleepScheduleSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="workSchedule"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What's your typical work schedule?</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 9-5, night shift, flexible hours" {...field} />
            </FormControl>
            <FormDescription>
              Describe your typical work hours
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="sleepSchedule"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What time do you usually go to bed and wake up?</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Sleep 11pm-7am, Sleep 1am-9am" {...field} />
            </FormControl>
            <FormDescription>
              Your typical sleep schedule
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="overnightGuests"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How do you feel about roommates having partners overnight?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="yes" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Yes, that's fine
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="no" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    No, not comfortable with that
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="occasionally" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Occasionally is fine
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
