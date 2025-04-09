
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";

interface CleanlinessProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function CleanlinessSection({ form }: CleanlinessProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="cleanliness"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How would you describe your level of cleanliness?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="veryTidy" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Very tidy (clean regularly, everything has its place)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="somewhatTidy" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Somewhat tidy (generally clean but not obsessive)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="doesntMindMess" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Doesn't mind mess (clean when necessary)
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="cleaningFrequency"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How often do you like to clean common areas?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="daily" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Daily
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="weekly" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Weekly
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="biweekly" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Bi-weekly
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="monthly" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Monthly
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="asNeeded" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    As needed
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
