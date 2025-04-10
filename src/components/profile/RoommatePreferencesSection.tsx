
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";

interface RoommatePreferencesSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  handleTraitToggle: (trait: string) => void;
  traitsList: string[];
}

export function RoommatePreferencesSection({ form, handleTraitToggle, traitsList }: RoommatePreferencesSectionProps) {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Roommate Preferences</h3>
        <p className="text-sm text-gray-500">
          Tell us more about what you're looking for in a roommate.
        </p>
      </div>

      <FormField
        control={form.control}
        name="roommateGenderPreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you have a gender preference for your roommate?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="sameGender" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Same gender as me
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="femaleOnly" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Female only
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="maleOnly" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Male only
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="noPreference" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    No preference
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
        name="roommateAgePreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>What age range do you prefer for your roommate?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="similar" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Similar to my age
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="younger" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Younger
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="older" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Older
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="noAgePreference" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    No preference
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
        name="roommateLifestylePreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>What lifestyle do you prefer in a roommate?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="similar" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Similar to my lifestyle
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="moreActive" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    More active/social than me
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="quieter" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Quieter/more reserved than me
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="noLifestylePreference" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    No preference
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
        name="importantRoommateTraits"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>Which traits are most important to you in a roommate?</FormLabel>
              <FormDescription>
                Select the traits that matter most to you
              </FormDescription>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {traitsList.map((trait) => (
                <FormItem
                  key={trait}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={form.getValues("importantRoommateTraits").includes(trait)}
                      onCheckedChange={() => handleTraitToggle(trait)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{trait}</FormLabel>
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
