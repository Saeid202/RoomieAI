
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your work schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day-shift">Day shift</SelectItem>
                  <SelectItem value="night-shift">Night shift</SelectItem>
                  <SelectItem value="remote">Remote work</SelectItem>
                  <SelectItem value="flexible">Flexible hours</SelectItem>
                  <SelectItem value="other">Other (specify below)</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>
              Select the option that best describes your work schedule
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="workScheduleDetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional details about your work schedule</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="e.g., I work 9-5 weekdays, or I work nights on weekends..."
                className="resize-none"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Add any specific details about your work hours
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="sleepTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What time do you usually go to bed?</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="wakeTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What time do you usually wake up?</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
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
