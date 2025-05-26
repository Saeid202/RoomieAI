
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface LifestyleMatchTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function LifestyleMatchTab({ form }: LifestyleMatchTabProps) {
  const nationalityPreference = form.watch("nationalityPreference");
  const languagePreference = form.watch("languagePreference");

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Lifestyle Compatibility 🌟</h3>
        <p className="text-muted-foreground mb-6">
          What lifestyle factors are important for a great roommate match?
        </p>
      </div>

      <div className="space-y-8">
        {/* Question 1: Gender Preference */}
        <FormField
          control={form.control}
          name="genderPreference"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">1. Gender Preference</FormLabel>
              <div className="grid grid-cols-1 gap-3 mt-3">
                {["male", "female", "non-binary", "no-preference"].map((option) => (
                  <FormField
                    key={option}
                    control={form.control}
                    name="genderPreference"
                    render={({ field }) => {
                      const isChecked = Array.isArray(field.value) && field.value.includes(option);
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentValue = Array.isArray(field.value) ? field.value : [];
                                if (checked) {
                                  field.onChange([...currentValue, option]);
                                } else {
                                  field.onChange(currentValue.filter((value) => value !== option));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal capitalize">
                            {option.replace("-", " ")}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />

        {/* Question 2: Nationality Preference */}
        <FormField
          control={form.control}
          name="nationalityPreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">2. Nationality Preference</FormLabel>
              <div className="space-y-3 mt-3">
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sameCountry" id="same-country" />
                      <FormLabel htmlFor="same-country">Same country</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="other-nationality" />
                      <FormLabel htmlFor="other-nationality">Other: specify</FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                
                {nationalityPreference === "custom" && (
                  <FormField
                    control={form.control}
                    name="nationalityCustom"
                    render={({ field }) => (
                      <FormItem className="ml-6">
                        <FormControl>
                          <Input 
                            placeholder="Please specify nationality preference..." 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </FormItem>
          )}
        />

        {/* Question 3: Language Preference */}
        <FormField
          control={form.control}
          name="languagePreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">3. Language Preference</FormLabel>
              <div className="space-y-3 mt-3">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="noPreference">No preference</SelectItem>
                    <SelectItem value="sameLanguage">Same language</SelectItem>
                    <SelectItem value="specific">Specific language</SelectItem>
                  </SelectContent>
                </Select>
                
                {languagePreference === "specific" && (
                  <FormField
                    control={form.control}
                    name="languageSpecific"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Please specify the language..." 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </FormItem>
          )}
        />

        {/* Question 4: Dietary Preferences */}
        <FormField
          control={form.control}
          name="diet"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold">4. Dietary Preferences</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="noRestrictions" id="no-restrictions" />
                    <FormLabel htmlFor="no-restrictions">No dietary restrictions</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vegetarian" id="vegetarian" />
                    <FormLabel htmlFor="vegetarian">Vegetarian</FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Question 5: Occupation Preference */}
        <FormField
          control={form.control}
          name="occupationPreference"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold">5. Do you have an occupation preference for your roommate?</FormLabel>
              <div className="space-y-3 mt-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "yes")}
                    value={field.value ? "yes" : "no"}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="occ-yes" />
                      <FormLabel htmlFor="occ-yes">Yes (please specify)</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="occ-no" />
                      <FormLabel htmlFor="occ-no">No</FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                
                {field.value && (
                  <FormField
                    control={form.control}
                    name="occupationSpecific"
                    render={({ field }) => (
                      <FormItem className="ml-6">
                        <FormControl>
                          <Input 
                            placeholder="Please specify occupation preference..." 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </FormItem>
          )}
        />

        {/* Question 6: Work Schedule Preference */}
        <FormField
          control={form.control}
          name="workSchedulePreference"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold">6. Do you have a work schedule preference for your roommate?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dayShift" id="day-shift-pref" />
                    <FormLabel htmlFor="day-shift-pref">Yes, I'm looking for a roommate with Day shift</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nightShift" id="night-shift-pref" />
                    <FormLabel htmlFor="night-shift-pref">I'm looking for a roommate with Night shift</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overnightShift" id="overnight-shift-pref" />
                    <FormLabel htmlFor="overnight-shift-pref">I'm looking for a roommate with Overnight shift</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="noPreference" id="no-pref" />
                    <FormLabel htmlFor="no-pref">No Preference</FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
