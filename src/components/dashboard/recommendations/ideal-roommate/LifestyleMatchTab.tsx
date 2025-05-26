
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

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

      <div className="space-y-4">
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
      </div>
    </div>
  );
}
