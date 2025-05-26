
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface HousingLifestyleTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

const HOBBIES_LIST = [
  "Reading", "Gaming", "Cooking", "Hiking", "Movies", "Music", "Art", "Sports",
  "Photography", "Yoga", "Crafting", "Gardening", "Writing", "Dancing", "Meditation"
];

export function HousingLifestyleTab({ form }: HousingLifestyleTabProps) {
  const [newLocation, setNewLocation] = useState("");
  const preferredLocations = form.watch("preferredLocation") || [];
  const hasPets = form.watch("hasPets");
  const selectedHobbies = form.watch("hobbies") || [];

  const addLocation = () => {
    if (newLocation.trim() && preferredLocations.length < 15) {
      form.setValue("preferredLocation", [...preferredLocations, newLocation.trim()]);
      setNewLocation("");
    }
  };

  const removeLocation = (index: number) => {
    const updated = preferredLocations.filter((_, i) => i !== index);
    form.setValue("preferredLocation", updated);
  };

  const handleHobbyToggle = (hobby: string) => {
    const currentHobbies = selectedHobbies;
    if (currentHobbies.includes(hobby)) {
      form.setValue("hobbies", currentHobbies.filter(h => h !== hobby));
    } else {
      form.setValue("hobbies", [...currentHobbies, hobby]);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Housing & Lifestyle Preferences 🏠</h3>
      <p className="text-muted-foreground">Tell us about your housing needs and lifestyle habits.</p>
      
      {/* Housing Preferences */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Housing Preferences</h4>
        
        <FormField
          control={form.control}
          name="preferredLocation"
          render={() => (
            <FormItem>
              <FormLabel>Preferred Locations (up to 15)</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                  />
                  <Button 
                    type="button" 
                    onClick={addLocation}
                    disabled={preferredLocations.length >= 15 || !newLocation.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferredLocations.map((location, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
                      <span className="text-sm">{location}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                        onClick={() => removeLocation(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <FormDescription>
                {preferredLocations.length}/15 locations added
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="moveInDateStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Move-in Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="moveInDateEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Move-in End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="housingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Housing Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select housing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="livingSpace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Living Space</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select living space" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="privateRoom">Private Room</SelectItem>
                      <SelectItem value="sharedRoom">Shared Room</SelectItem>
                      <SelectItem value="entirePlace">Entire Place</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Lifestyle Habits */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Lifestyle Habits</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="smoking"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Do you smoke?</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="livesWithSmokers"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Are you comfortable living with smokers?</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="hasPets"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Do you have pets?</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          
          {hasPets && (
            <FormField
              control={form.control}
              name="petType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What pet do you have?</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Golden Retriever, Persian Cat, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="workLocation"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Do you work from home or go to an office?</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="remote" />
                    </FormControl>
                    <FormLabel className="font-normal">Work from home</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="office" />
                    </FormControl>
                    <FormLabel className="font-normal">Go to office</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="hybrid" />
                    </FormControl>
                    <FormLabel className="font-normal">Hybrid (both)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workSchedule"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>What's your typical work schedule?</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="dayShift" />
                    </FormControl>
                    <FormLabel className="font-normal">Day shift</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="afternoonShift" />
                    </FormControl>
                    <FormLabel className="font-normal">Afternoon shift</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="overnightShift" />
                    </FormControl>
                    <FormLabel className="font-normal">Overnight shift</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hobbies"
          render={() => (
            <FormItem>
              <FormLabel>Hobbies & Activities</FormLabel>
              <FormDescription>Select activities you enjoy at home</FormDescription>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {HOBBIES_LIST.map((hobby) => (
                  <FormItem key={hobby} className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={selectedHobbies.includes(hobby)}
                        onCheckedChange={() => handleHobbyToggle(hobby)}
                      />
                    </FormControl>
                    <FormLabel className="font-normal text-sm">{hobby}</FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diet"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Dietary Preferences</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="vegetarian" />
                    </FormControl>
                    <FormLabel className="font-normal">I'm vegetarian</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="noRestrictions" />
                    </FormControl>
                    <FormLabel className="font-normal">I don't have restrictions</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
