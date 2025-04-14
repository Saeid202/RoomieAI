
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";

interface LeaseTermsSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function LeaseTermsSection({ form }: LeaseTermsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="stayDuration"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-lg font-bold text-primary">How long do you plan to stay?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="oneMonth" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    1 month
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="threeMonths" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    3 months
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="sixMonths" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    6 months
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="oneYear" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    1 year
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="flexible" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Flexible
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
        name="leaseTerm"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-lg font-bold text-primary">What is your ideal lease duration?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="shortTerm" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Short-term (less than 6 months)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="longTerm" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Long-term (6 months or more)
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
