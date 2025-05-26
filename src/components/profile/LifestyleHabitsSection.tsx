
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";

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
  const hasPets = form.watch("hasPets");

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="smoking"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Do you smoke?</FormLabel>
                  <FormDescription>
                    Let potential roommates know about your smoking habits
                  </FormDescription>
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
          
          <FormField
            control={form.control}
            name="livesWithSmokers"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Are you comfortable living with smokers?</FormLabel>
                  <FormDescription>
                    Would you be okay with roommates who smoke?
                  </FormDescription>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="hasPets"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Do you have pets?</FormLabel>
                  <FormDescription>
                    Indicate if you currently have any pets
                  </FormDescription>
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
          
          {hasPets && (
            <FormField
              control={form.control}
              name="petType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What pet do you have?</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Golden Retriever, Persian Cat, etc."
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Please specify the type/breed of your pet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
      
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
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>Hobbies & Activities</FormLabel>
              <FormDescription>
                Select activities you enjoy at home
              </FormDescription>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {hobbiesList.map((hobby) => (
                <FormItem
                  key={hobby}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={form.getValues("hobbies").includes(hobby)}
                      onCheckedChange={() => handleHobbyToggle(hobby)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{hobby}</FormLabel>
                </FormItem>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
