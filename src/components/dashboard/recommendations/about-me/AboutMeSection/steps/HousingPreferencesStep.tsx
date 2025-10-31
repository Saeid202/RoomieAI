import { useFormContext } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

export function HousingPreferencesStep() {
  const form = useFormContext<ProfileFormValues>();
  const [newLocation, setNewLocation] = useState("");
  const preferredLocations = form.watch("preferredLocation") || [];

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

  return (
    <div className="space-y-4">
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
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="housingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Housing Type</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
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
              <Select onValueChange={field.onChange} value={field.value}>
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
  );
}
