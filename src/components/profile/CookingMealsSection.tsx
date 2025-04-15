
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";

interface CookingMealsSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function CookingMealsSection({ form }: CookingMealsSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="diet"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Are you vegetarian, vegan, or omnivore?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="vegetarian" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Vegetarian
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="vegan" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Vegan
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="omnivore" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Omnivore (eat everything)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="other" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Other dietary preference
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
        name="cookingSharing"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you share cooking duties or prefer separate meals?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="share" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Share cooking and meals
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="separate" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Prefer separate cooking and meals
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
        name="dietaryNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional dietary information</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Any food allergies, specific preferences, or other details about your diet..."
                className="resize-none"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Share any other important information about your food preferences
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
