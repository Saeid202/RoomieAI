
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";

interface LifestyleHabitsSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  handleHobbyToggle: (hobby: string) => void;
  hobbiesList: string[];
}

export function LifestyleHabitsSection({ form, handleHobbyToggle, hobbiesList }: LifestyleHabitsSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="smoking"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Do you smoke?
              </FormLabel>
              <FormDescription>
                Check this box if you are a smoker
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="livesWithSmokers"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Are you comfortable living with smokers?
              </FormLabel>
              <FormDescription>
                Check this box if you're fine living with someone who smokes
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="hasPets"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Do you have pets?
              </FormLabel>
              <FormDescription>
                Check this box if you own pets
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="petPreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Are you okay with living with pets?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="noPets" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    No pets, please
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="onlyCats" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Only cats
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="onlyDogs" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Only dogs
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="both" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Open to both
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
        name="workLocation"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you work from home or go to an office?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="remote" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Work from home
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="office" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Go to office
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="hybrid" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Hybrid (both)
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
        name="dailyRoutine"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>What is your typical daily routine?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="morning" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Morning person (early riser)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="night" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Night owl (stay up late)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="mixed" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Mixed/Flexible schedule
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
        name="hobbies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hobbies & Activities</FormLabel>
            <FormDescription>
              Select activities you enjoy at home
            </FormDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              {hobbiesList.map((hobby) => (
                <div
                  key={hobby}
                  onClick={() => handleHobbyToggle(hobby)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    form.getValues("hobbies").includes(hobby)
                      ? "bg-roomie-purple text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {hobby}
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
