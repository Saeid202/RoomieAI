
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Home, Building, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface HousingPreferencesSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function HousingPreferencesSection({ form }: HousingPreferencesSectionProps) {
  const [locations, setLocations] = useState<string[]>([""]);
  const [moveInStartDate, setMoveInStartDate] = useState<Date | undefined>();
  const [moveInEndDate, setMoveInEndDate] = useState<Date | undefined>();

  const addLocation = () => {
    if (locations.length < 15) {
      setLocations([...locations, ""]);
    }
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      const newLocations = locations.filter((_, i) => i !== index);
      setLocations(newLocations);
      // Update form value
      form.setValue("preferredLocation", newLocations.join(", "));
    }
  };

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
    // Update form value
    form.setValue("preferredLocation", newLocations.filter(loc => loc.trim()).join(", "));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-1 md:col-span-2">
        <FormLabel>Preferred Locations (up to 15)</FormLabel>
        <FormDescription className="mb-4">
          Add multiple locations you'd like to live in
        </FormDescription>
        <div className="space-y-3">
          {locations.map((location, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Location ${index + 1}: City, Neighborhood, ZIP code`}
                value={location}
                onChange={(e) => updateLocation(index, e.target.value)}
                className="flex-1"
              />
              {locations.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeLocation(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {locations.length < 15 && (
            <Button
              type="button"
              variant="outline"
              onClick={addLocation}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Location
            </Button>
          )}
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-2">
        <FormLabel>Preferred Move-in Duration</FormLabel>
        <FormDescription className="mb-4">
          Select your preferred move-in period
        </FormDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel className="text-sm">Start Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !moveInStartDate && "text-muted-foreground"
                  )}
                >
                  {moveInStartDate ? (
                    format(moveInStartDate, "PPP")
                  ) : (
                    <span>Pick start date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={moveInStartDate}
                  onSelect={(date) => {
                    setMoveInStartDate(date);
                    if (date) form.setValue("moveInDate", date);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <FormLabel className="text-sm">End Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !moveInEndDate && "text-muted-foreground"
                  )}
                >
                  {moveInEndDate ? (
                    format(moveInEndDate, "PPP")
                  ) : (
                    <span>Pick end date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={moveInEndDate}
                  onSelect={setMoveInEndDate}
                  disabled={(date) => date < new Date() || (moveInStartDate && date < moveInStartDate)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="budgetRange"
        render={({ field }) => (
          <FormItem className="col-span-1 md:col-span-2">
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
        name="housingType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Housing Type Preference</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="house" />
                  </FormControl>
                  <FormLabel className="font-normal flex items-center gap-1">
                    <Home className="h-4 w-4" /> House
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="apartment" />
                  </FormControl>
                  <FormLabel className="font-normal flex items-center gap-1">
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
            <FormLabel>Living Space Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex space-x-6">
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="privateRoom" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Private room
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="sharedRoom" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Shared room
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="entirePlace" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Entire place
                    </FormLabel>
                  </FormItem>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stayDuration"
        render={({ field }) => (
          <FormItem className="space-y-3 col-span-1 md:col-span-2">
            <FormLabel className="text-lg font-bold text-primary">How long do you plan to stay?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
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
    </div>
  );
}
