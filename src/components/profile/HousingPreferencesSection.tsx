
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Home, Building } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

interface HousingPreferencesSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function HousingPreferencesSection({ form }: HousingPreferencesSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="preferredLocation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Location</FormLabel>
            <FormControl>
              <Input placeholder="City, Neighborhood, ZIP code, or exact address" {...field} />
            </FormControl>
            <FormDescription>
              Where are you looking to live?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="budgetRange"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monthly Budget Range ($)</FormLabel>
            <FormControl>
              <div className="pt-5 px-2">
                <Slider
                  defaultValue={field.value}
                  min={500}
                  max={3000}
                  step={50}
                  onValueChange={field.onChange}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>${field.value[0]}</span>
                  <span>${field.value[1]}</span>
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Monthly rent you're comfortable with
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="moveInDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Preferred Move-in Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <FormDescription>
              When would you like to move in?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="housingType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you prefer to live in a house or apartment?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="house" />
                  </FormControl>
                  <FormLabel className="font-normal flex items-center gap-2">
                    <Home className="h-4 w-4" /> House
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="apartment" />
                  </FormControl>
                  <FormLabel className="font-normal flex items-center gap-2">
                    <Building className="h-4 w-4" /> Apartment
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
        name="livingSpace"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>What type of living space are you looking for?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="privateRoom" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Private room
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="sharedRoom" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Shared room
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="entirePlace" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Entire place
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
