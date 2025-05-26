
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface LanguagePreferenceQuestionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function LanguagePreferenceQuestion({ form }: LanguagePreferenceQuestionProps) {
  const languagePreference = form.watch("languagePreference");

  return (
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
  );
}
