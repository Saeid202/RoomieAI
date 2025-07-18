
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

interface LifestyleHabitsSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  handleHobbyToggle: (hobby: string) => void;
  hobbiesList: string[];
}

export function LifestyleHabitsSection({ 
  form, 
  handleHobbyToggle, 
  hobbiesList 
}: LifestyleHabitsSectionProps) {
  const selectedHobbies = form.watch("hobbies") || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Lifestyle & Habits</h3>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="smoking"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold"><span className="font-bold">6.</span> Do you smoke?</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={(value) => field.onChange(value === "true")} 
                  value={field.value ? "true" : "false"} 
                  className="flex flex-row space-x-6"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="true" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="false" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="livesWithSmokers"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold"><span className="font-bold">7.</span> Are you comfortable living with smokers?</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={(value) => field.onChange(value === "true")} 
                  value={field.value ? "true" : "false"} 
                  className="flex flex-row space-x-6"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="true" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="false" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasPets"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold"><span className="font-bold">8.</span> Do you have pets?</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={(value) => field.onChange(value === "true")} 
                  value={field.value ? "true" : "false"} 
                  className="flex flex-row space-x-6"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="true" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="false" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <FormLabel className="text-base mb-4 block font-semibold"><span className="font-bold">9.</span> Hobbies & Interests</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {hobbiesList.map((hobby) => (
            <Badge
              key={hobby}
              variant={selectedHobbies.includes(hobby) ? "default" : "outline"}
              className="cursor-pointer text-center py-2"
              onClick={() => handleHobbyToggle(hobby)}
            >
              {hobby}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
