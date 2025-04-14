
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField, FormItem } from "@/components/ui/form";
import { ProfileFormValues } from "@/types/profile";

interface HouseHabitsTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function HouseHabitsTab({ form }: HouseHabitsTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">House Rules & Habits! 🏡</h3>
      <p className="text-muted-foreground">Seeking someone who shares your "dishes don't wash themselves" philosophy? Let's set some ground rules! 📝</p>
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Important house rules:</h4>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="houseHabits.cleansKitchen"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox 
                  id="clean-kitchen" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="clean-kitchen">Cleans up kitchen after use</Label>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="houseHabits.respectsQuietHours"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox 
                  id="quiet-hours" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="quiet-hours">Respects quiet hours</Label>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="houseHabits.sharesGroceries"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox 
                  id="shared-groceries" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="shared-groceries">Willing to share groceries</Label>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
