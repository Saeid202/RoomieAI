
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface GenderPreferenceQuestionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function GenderPreferenceQuestion({ form }: GenderPreferenceQuestionProps) {
  return (
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
  );
}
