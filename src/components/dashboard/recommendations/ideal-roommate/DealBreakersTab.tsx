
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

interface DealBreakersTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function DealBreakersTab({ form }: DealBreakersTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Deal Breakers 🚫</h3>
        <p className="text-muted-foreground mb-6">
          What are your absolute no-goes when it comes to roommates?
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="smoking"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">No Smoking</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Roommate should not smoke inside or outside the property
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={!field.value}
                  onCheckedChange={(checked) => field.onChange(!checked)}
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
                <FormLabel className="text-base">No Pets</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Roommate should not have any pets
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={!field.value}
                  onCheckedChange={(checked) => field.onChange(!checked)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
