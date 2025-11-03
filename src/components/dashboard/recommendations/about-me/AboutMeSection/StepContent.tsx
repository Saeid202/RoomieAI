import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, User, Mail, Phone, Globe, Calendar, Home, Utensils, Briefcase, Heart } from "lucide-react";
import { useState } from "react";

interface StepContentProps {
  step: number;
  form: UseFormReturn<ProfileFormValues>;
}

const NATIONALITIES = ["American", "Canadian", "British", "Australian", "German", "French", "Italian", "Spanish", "Japanese", "Chinese", "Indian", "Brazilian", "Mexican", "Iranian", "Other"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Arabic", "Hindi", "Russian", "Farsi", "Other"];
const ETHNICITIES = ["White/Caucasian", "Black/African American", "Hispanic/Latino", "Asian", "Native American", "Middle Eastern", "Mixed/Multiracial", "Other", "Prefer not to say"];
const RELIGIONS = ["Christianity", "Islam", "Judaism", "Hinduism", "Buddhism", "Sikhism", "Atheist", "Agnostic", "Other", "Prefer not to say"];
const HOBBIES_LIST = ["Reading", "Gaming", "Cooking", "Hiking", "Movies", "Music", "Art", "Sports", "Photography", "Yoga", "Crafting", "Gardening", "Writing", "Dancing", "Meditation"];

// Helper function to format display values
const formatDisplayValue = (value: any, fieldName: string) => {
  if (!value && value !== false && value !== 0) return "Not specified";
  
  if (typeof value === "boolean") return value ? "Yes" : "No";
  
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    return value.join(", ");
  }
  
  if (fieldName === "gender") {
    const genderMap: { [key: string]: string } = {
      "male": "Male",
      "female": "Female", 
      "lesbian": "Lesbian",
      "gay": "Gay",
      "bisexual": "Bisexual",
      "transgender": "Transgender",
      "non-binary": "Non-binary",
      "prefer-not-to-say": "Prefer not to say"
    };
    return genderMap[value] || value;
  }
  
  if (fieldName === "workLocation") {
    const workLocationMap: { [key: string]: string } = {
      "remote": "Work from home",
      "office": "Go to office", 
      "hybrid": "Hybrid (both)"
    };
    return workLocationMap[value] || value;
  }
  
  if (fieldName === "workSchedule") {
    const workScheduleMap: { [key: string]: string } = {
      "dayShift": "Day shift",
      "afternoonShift": "Afternoon shift", 
      "overnightShift": "Overnight shift"
    };
    return workScheduleMap[value] || value;
  }
  
  if (fieldName === "diet") {
    const dietMap: { [key: string]: string } = {
      "vegetarian": "Vegetarian",
      "halal": "Halal only", 
      "kosher": "Kosher only",
      "noPreference": "No restrictions",
      "other": "Other"
    };
    return dietMap[value] || value;
  }
  
  if (fieldName === "housingType") {
    const housingMap: { [key: string]: string } = {
      "apartment": "Apartment",
      "house": "House"
    };
    return housingMap[value] || value;
  }
  
  if (fieldName === "livingSpace") {
    const livingSpaceMap: { [key: string]: string } = {
      "privateRoom": "Private Room",
      "sharedRoom": "Shared Room", 
      "entirePlace": "Entire Place"
    };
    return livingSpaceMap[value] || value;
  }
  
  if (typeof value === "string") {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  
  return value.toString();
};

export function StepContent({ step, form }: StepContentProps) {
  const [newLocation, setNewLocation] = useState("");
  const preferredLocations = form.watch("preferredLocation") || [];
  const profileVisibility = form.watch("profileVisibility") || [];
  const dietValue = form.watch("diet");
  const hasPets = form.watch("hasPets");
  const selectedHobbies = form.watch("hobbies") || [];
  const formData = form.watch();

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

  const handleVisibilityToggle = (option: string) => {
    const current = profileVisibility;
    if (current.includes(option)) {
      form.setValue("profileVisibility", current.filter(item => item !== option));
    } else {
      form.setValue("profileVisibility", [...current, option]);
    }
  };

  const handleHobbyToggle = (hobby: string) => {
    const currentHobbies = selectedHobbies;
    if (currentHobbies.includes(hobby)) {
      form.setValue("hobbies", currentHobbies.filter(h => h !== hobby));
    } else {
      form.setValue("hobbies", [...currentHobbies, hobby]);
    }
  };

  switch (step) {
    case 0: // Personal Information
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter your age" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="lesbian">Lesbian</SelectItem>
                      <SelectItem value="gay">Gay</SelectItem>
                      <SelectItem value="bisexual">Bisexual</SelectItem>
                      <SelectItem value="transgender">Transgender</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 1: // Contact & Privacy
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="profileVisibility"
            render={() => (
              <FormItem>
                <FormLabel>Profile Visibility</FormLabel>
                <div className="space-y-2">
                  {["gays", "lesbians", "transgenders", "everybody"].map((option) => (
                    <FormItem key={option} className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={profileVisibility.includes(option)}
                          onCheckedChange={() => handleVisibilityToggle(option)}
                        />
                      </FormControl>
                      <FormLabel className="font-normal capitalize">{option}</FormLabel>
                    </FormItem>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 2: // Background & Identity
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((nationality) => (
                        <SelectItem key={nationality} value={nationality.toLowerCase()}>
                          {nationality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Language</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language} value={language.toLowerCase()}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ethnicity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ethnicity</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      {ETHNICITIES.map((ethnicity) => (
                        <SelectItem key={ethnicity} value={ethnicity.toLowerCase()}>
                          {ethnicity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 3: // Occupation & Lifestyle
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupation</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your occupation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="workLocation"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Work Location</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
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
                <FormLabel>Work Schedule</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
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
        </div>
      );

    case 4: // Diet & Preferences
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="diet"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Dietary Preferences</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="vegetarian" />
                      </FormControl>
                      <FormLabel className="font-normal">I'm vegetarian</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="halal" />
                      </FormControl>
                      <FormLabel className="font-normal">I'm eating only halal</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="kosher" />
                      </FormControl>
                      <FormLabel className="font-normal">I'm eating only kosher</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="noPreference" />
                      </FormControl>
                      <FormLabel className="font-normal">I don't have restrictions</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="font-normal">Other (specify)</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {dietValue === "other" && (
            <FormField
              control={form.control}
              name="dietOther"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Please specify your dietary restrictions</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your dietary restrictions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="religion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Religion</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map((religion) => (
                        <SelectItem key={religion} value={religion.toLowerCase()}>
                          {religion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 5: // Housing Preferences
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
      );

    case 6: // Lifestyle Habits
      return (
        <div className="space-y-4">
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
        </div>
      );

    case 7: // Final Details
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

    case 8: // Review Step
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-green-600 mb-2">Ready to Complete Your Profile! 🎉</h3>
            <p className="text-muted-foreground">Review your information before saving</p>
          </div>

          <div className="grid gap-6">
            {/* Personal Information Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-5 w-5 text-blue-500" />
                  <h4 className="text-lg font-semibold">Personal Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="font-medium">{formatDisplayValue(formData.fullName, "fullName")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Age</label>
                    <p className="font-medium">{formatDisplayValue(formData.age, "age")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="font-medium">{formatDisplayValue(formData.gender, "gender")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Background Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-5 w-5 text-green-500" />
                  <h4 className="text-lg font-semibold">Contact & Background</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{formatDisplayValue(formData.email, "email")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium">{formatDisplayValue(formData.phoneNumber, "phoneNumber")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                    <p className="font-medium">{formatDisplayValue(formData.nationality, "nationality")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Language</label>
                    <p className="font-medium">{formatDisplayValue(formData.language, "language")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ethnicity</label>
                    <p className="font-medium">{formatDisplayValue(formData.ethnicity, "ethnicity")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Religion</label>
                    <p className="font-medium">{formatDisplayValue(formData.religion, "religion")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work & Lifestyle Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                  <h4 className="text-lg font-semibold">Work & Lifestyle</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                    <p className="font-medium">{formatDisplayValue(formData.occupation, "occupation")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Work Location</label>
                    <p className="font-medium">{formatDisplayValue(formData.workLocation, "workLocation")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Work Schedule</label>
                    <p className="font-medium">{formatDisplayValue(formData.workSchedule, "workSchedule")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dietary Preference</label>
                    <p className="font-medium">
                      {formatDisplayValue(formData.diet, "diet")}
                      {formData.diet === "other" && formData.dietOther && ` - ${formData.dietOther}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Housing Preferences Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="h-5 w-5 text-orange-500" />
                  <h4 className="text-lg font-semibold">Housing Preferences</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferred Locations</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.preferredLocation?.map((location, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Housing Type</label>
                    <p className="font-medium">{formatDisplayValue(formData.housingType, "housingType")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Living Space</label>
                    <p className="font-medium">{formatDisplayValue(formData.livingSpace, "livingSpace")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                    <p className="font-medium">${formData.budgetRange?.[0]} - ${formData.budgetRange?.[1]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lifestyle Habits Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h4 className="text-lg font-semibold">Lifestyle Habits</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Smoking</label>
                    <p className="font-medium">{formatDisplayValue(formData.smoking, "smoking")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Comfortable with Smokers</label>
                    <p className="font-medium">{formatDisplayValue(formData.livesWithSmokers, "livesWithSmokers")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Has Pets</label>
                    <p className="font-medium">{formatDisplayValue(formData.hasPets, "hasPets")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Profile Visibility</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.profileVisibility?.map((visibility, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {visibility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hobbies & Interests Card */}
            {formData.hobbies && formData.hobbies.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Utensils className="h-5 w-5 text-indigo-500" />
                    <h4 className="text-lg font-semibold">Hobbies & Interests</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.hobbies.map((hobby, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {hobby}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">i</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Ready to Save?</h4>
                <p className="text-blue-700 text-sm">
                  Your profile looks great! Click the "Save Profile" button below to complete your registration. 
                  You can always edit this information later from your profile settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}