
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface IdealRoommateFormProps {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isSaving: boolean;
}

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "No preference"];
const HOBBIES_LIST = [
  "Reading", "Gaming", "Cooking", "Hiking", "Movies", "Music", "Art", "Sports",
  "Photography", "Yoga", "Crafting", "Gardening", "Writing", "Dancing", "Meditation"
];

export function IdealRoommateForm({ form, onSubmit, isSaving }: IdealRoommateFormProps) {
  const nationalityPreference = form.watch("nationalityPreference");
  const languagePreference = form.watch("languagePreference");
  const ethnicReligionPreference = form.watch("ethnicReligionPreference");
  const occupationPreference = form.watch("occupationPreference");
  const genderPreference = form.watch("genderPreference") || [];
  const roommateHobbies = form.watch("roommateHobbies") || [];

  const handleGenderToggle = (gender: string) => {
    if (genderPreference.includes(gender)) {
      form.setValue("genderPreference", genderPreference.filter(g => g !== gender));
    } else {
      form.setValue("genderPreference", [...genderPreference, gender]);
    }
  };

  const handleHobbyToggle = (hobby: string) => {
    if (roommateHobbies.includes(hobby)) {
      form.setValue("roommateHobbies", roommateHobbies.filter(h => h !== hobby));
    } else {
      form.setValue("roommateHobbies", [...roommateHobbies, hobby]);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Select Your Ideal Roommate Preferences 🤝</h3>
        <p className="text-muted-foreground mb-6">Help us find the perfect roommate match for you!</p>
      </div>

      {/* Question 1: Gender Preference */}
      <FormField
        control={form.control}
        name="genderPreference"
        render={() => (
          <FormItem>
            <FormLabel>1. Do you have a gender preference for your roommate?</FormLabel>
            <FormDescription>Select all that apply</FormDescription>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {GENDER_OPTIONS.map((gender) => (
                <FormItem key={gender} className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={genderPreference.includes(gender)}
                      onCheckedChange={() => handleGenderToggle(gender)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{gender}</FormLabel>
                </FormItem>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Question 2: Nationality Preference */}
      <FormField
        control={form.control}
        name="nationalityPreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>2. Do you have a nationality preference for your roommate?</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="sameCountry" />
                  </FormControl>
                  <FormLabel className="font-normal">Only from my country</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="noPreference" />
                  </FormControl>
                  <FormLabel className="font-normal">No preference</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="custom" />
                  </FormControl>
                  <FormLabel className="font-normal">Custom preference</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {nationalityPreference === "custom" && (
        <FormField
          control={form.control}
          name="nationalityCustom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please specify your nationality preference</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your nationality preference..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Question 3: Language Preference */}
      <FormField
        control={form.control}
        name="languagePreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>3. Do you have a language preference for your roommate?</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="sameLanguage" />
                  </FormControl>
                  <FormLabel className="font-normal">The same language as me</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="noPreference" />
                  </FormControl>
                  <FormLabel className="font-normal">I have no preference</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="specific" />
                  </FormControl>
                  <FormLabel className="font-normal">Specific language</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {languagePreference === "specific" && (
        <FormField
          control={form.control}
          name="languageSpecific"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please specify the language</FormLabel>
              <FormControl>
                <Input placeholder="Enter preferred language" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Question 4: Ethnic & Religion Preference */}
      <FormField
        control={form.control}
        name="ethnicReligionPreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>4. Do you have an ethnic & religion preference for your roommate?</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="same" />
                  </FormControl>
                  <FormLabel className="font-normal">The same ethnic & religion as me</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="noPreference" />
                  </FormControl>
                  <FormLabel className="font-normal">I have no preference</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="other" />
                  </FormControl>
                  <FormLabel className="font-normal">Other</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {ethnicReligionPreference === "other" && (
        <FormField
          control={form.control}
          name="ethnicReligionOther"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please specify</FormLabel>
              <FormControl>
                <Input placeholder="Enter your preference" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Question 5: Occupation Preference */}
      <FormField
        control={form.control}
        name="occupationPreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>5. Do you have an occupation preference for your roommate?</FormLabel>
            <FormControl>
              <RadioGroup 
                onValueChange={(value) => field.onChange(value === "true")} 
                value={field.value ? "true" : "false"} 
                className="flex flex-col space-y-1"
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

      {occupationPreference && (
        <FormField
          control={form.control}
          name="occupationSpecific"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please specify the occupation</FormLabel>
              <FormControl>
                <Input placeholder="Enter preferred occupation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Question 6: Work Schedule Preference */}
      <FormField
        control={form.control}
        name="workSchedulePreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>6. Do you have a work schedule preference for your roommate?</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="opposite" />
                  </FormControl>
                  <FormLabel className="font-normal">Yes, I'm looking for opposite work schedule as me</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="dayShift" />
                  </FormControl>
                  <FormLabel className="font-normal">Day shift</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="nightShift" />
                  </FormControl>
                  <FormLabel className="font-normal">Night shift</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="overnightShift" />
                  </FormControl>
                  <FormLabel className="font-normal">Overnight shift</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="noPreference" />
                  </FormControl>
                  <FormLabel className="font-normal">No preference</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Question 7: Hobbies & Activities */}
      <FormField
        control={form.control}
        name="roommateHobbies"
        render={() => (
          <FormItem>
            <FormLabel>7. Select any hobbies & activities preference for your roommate</FormLabel>
            <FormDescription>Select all that apply</FormDescription>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {HOBBIES_LIST.map((hobby) => (
                <FormItem key={hobby} className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={roommateHobbies.includes(hobby)}
                      onCheckedChange={() => handleHobbyToggle(hobby)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-sm">{hobby}</FormLabel>
                </FormItem>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Question 8: Rent Options */}
      <FormField
        control={form.control}
        name="rentOption"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>8. Rent Options</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="findTogether" />
                  </FormControl>
                  <FormLabel className="font-normal">I'm looking for a roommate to go and find a new place together</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="joinExisting" />
                  </FormControl>
                  <FormLabel className="font-normal">I'm looking for a roommate who already has a place to share</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </form>
  );
}
