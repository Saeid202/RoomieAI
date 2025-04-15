
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField, FormItem } from "@/components/ui/form";
import { ProfileFormValues } from "@/types/profile";

interface DealBreakersTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function DealBreakersTab({ form }: DealBreakersTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Absolutely Not! 🙅‍♂️</h3>
      <p className="text-muted-foreground">What crosses the line? Midnight drum practice? Pineapple on pizza? We won't judge (much)! 🍍</p>
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">My deal breakers:</h4>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="dealBreakers.noSmoking"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox 
                  id="smoking" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="smoking">Smoking indoors</Label>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dealBreakers.noLoudMusic"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox 
                  id="loud-music" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="loud-music">Frequently playing loud music</Label>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dealBreakers.noLatePayments"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox 
                  id="late-payments" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="late-payments">History of late rent payments</Label>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
