
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

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
  const selectedHobbies = form.watch("hobbies") || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Lifestyle & Habits</h3>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="smoking"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">I smoke</FormLabel>
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
          name="hasPets"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">I have pets</FormLabel>
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

      <div>
        <FormLabel className="text-base mb-4 block">Hobbies & Interests</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {hobbiesList.map((hobby) => (
            <Badge
              key={hobby}
              variant={selectedHobbies.includes(hobby) ? "default" : "outline"}
              className="cursor-pointer text-center py-2"
              onClick={() => handleHobbyToggle(hobby)}
            >
              {hobby}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
