
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LifestyleMatchTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function LifestyleMatchTab({ form }: LifestyleMatchTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Lifestyle Compatibility 🌟</h3>
        <p className="text-muted-foreground mb-6">
          What lifestyle factors are important for a great roommate match?
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="genderPreference"
          render={() => (
            <FormItem>
              <FormLabel>Gender Preference</FormLabel>
              <div className="grid grid-cols-1 gap-3">
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

        <FormField
          control={form.control}
          name="nationalityPreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationality Preference</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="noPreference">No preference</SelectItem>
                  <SelectItem value="sameCountry">Same country</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="languagePreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language Preference</FormLabel>
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
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workSchedulePreference"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Work Schedule Preference</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="noPreference" id="no-pref" />
                    <FormLabel htmlFor="no-pref">No preference</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dayShift" id="day-shift-pref" />
                    <FormLabel htmlFor="day-shift-pref">Similar schedule (day shift)</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="opposite" id="opposite-shift" />
                    <FormLabel htmlFor="opposite-shift">Opposite schedule (more privacy)</FormLabel>
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
