import { useFormContext } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const HOBBIES_LIST = ["Reading", "Gaming", "Cooking", "Hiking", "Movies", "Music", "Art", "Sports", "Photography", "Yoga", "Crafting", "Gardening", "Writing", "Dancing", "Meditation"];

export function FinalDetailsStep() {
  const form = useFormContext<ProfileFormValues>();
  const selectedHobbies = form.watch("hobbies") || [];

  const handleHobbyToggle = (hobby: string) => {
    const currentHobbies = selectedHobbies;
    if (currentHobbies.includes(hobby)) {
      form.setValue("hobbies", currentHobbies.filter(h => h !== hobby));
    } else {
      form.setValue("hobbies", [...currentHobbies, hobby]);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="budgetRange"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Budget Range ($)</FormLabel>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <FormLabel className="text-sm text-muted-foreground">Minimum</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Min budget"
                    value={field.value[0]}
                    onChange={(e) => field.onChange([Number(e.target.value), field.value[1]])}
                  />
                </FormControl>
              </div>
              <div className="flex-1">
                <FormLabel className="text-sm text-muted-foreground">Maximum</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Max budget"
                    value={field.value[1]}
                    onChange={(e) => field.onChange([field.value[0], Number(e.target.value)])}
                  />
                </FormControl>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hobbies"
        render={() => (
          <FormItem>
            <FormLabel>Hobbies & Interests</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {HOBBIES_LIST.map((hobby) => (
                <FormItem key={hobby} className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={selectedHobbies.includes(hobby)}
                      onCheckedChange={() => handleHobbyToggle(hobby)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-sm cursor-pointer">{hobby}</FormLabel>
                </FormItem>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
