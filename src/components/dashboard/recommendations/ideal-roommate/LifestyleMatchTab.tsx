
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField, FormItem } from "@/components/ui/form";
import { ProfileFormValues } from "@/types/profile";

interface LifestyleMatchTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function LifestyleMatchTab({ form }: LifestyleMatchTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Lifestyle Twins or Opposites? 🎭</h3>
      <p className="text-muted-foreground">Does your ideal roomie need to match your wild party schedule or balance it out? No wrong answers! 🎉</p>
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Looking for someone who:</h4>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="lifestylePreferences.similarSchedule"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox 
                  id="similar-schedule" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="similar-schedule">Has a similar daily schedule</Label>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lifestylePreferences.similarInterests"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox 
                  id="similar-interests" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="similar-interests">Shares my interests and hobbies</Label>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lifestylePreferences.compatibleWorkStyle"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox 
                  id="work-style" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="work-style">Has a compatible work style with me</Label>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
