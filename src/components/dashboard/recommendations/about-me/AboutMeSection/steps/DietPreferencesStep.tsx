import { useFormContext } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const RELIGIONS = ["Christianity", "Islam", "Judaism", "Hinduism", "Buddhism", "Sikhism", "Atheist", "Agnostic", "Other", "Prefer not to say"];

export function DietPreferencesStep() {
  const form = useFormContext<ProfileFormValues>();
  const dietValue = form.watch("diet");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="diet"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Dietary Preferences</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="vegetarian" />
                  </FormControl>
                  <FormLabel className="font-normal">I'm vegetarian</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="halal" />
                  </FormControl>
                  <FormLabel className="font-normal">I'm eating only halal</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="kosher" />
                  </FormControl>
                  <FormLabel className="font-normal">I'm eating only kosher</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="noPreference" />
                  </FormControl>
                  <FormLabel className="font-normal">I don't have restrictions</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="other" />
                  </FormControl>
                  <FormLabel className="font-normal">Other (specify)</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {dietValue === "other" && (
        <FormField
          control={form.control}
          name="dietOther"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please specify your dietary restrictions</FormLabel>
              <FormControl>
                <Input placeholder="Enter your dietary restrictions" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="religion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Religion</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select religion" />
                </SelectTrigger>
                <SelectContent>
                  {RELIGIONS.map((religion) => (
                    <SelectItem key={religion} value={religion.toLowerCase()}>
                      {religion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
