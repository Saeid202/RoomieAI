
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PersonalInfoTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

const NATIONALITIES = [
  "American", "Canadian", "British", "Australian", "German", "French", "Italian", "Spanish", 
  "Japanese", "Chinese", "Indian", "Brazilian", "Mexican", "Iranian", "Other"
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", 
  "Japanese", "Arabic", "Hindi", "Russian", "Other"
];

const ETHNICITIES = [
  "White/Caucasian", "Black/African American", "Hispanic/Latino", "Asian", 
  "Native American", "Middle Eastern", "Mixed/Multiracial", "Other", "Prefer not to say"
];

const RELIGIONS = [
  "Christianity", "Islam", "Judaism", "Hinduism", "Buddhism", "Sikhism", 
  "Atheist", "Agnostic", "Other", "Prefer not to say"
];

export function PersonalInfoTab({ form }: PersonalInfoTabProps) {
  const profileVisibility = form.watch("profileVisibility") || [];
  const hasPets = form.watch("hasPets");
  const dietValue = form.watch("diet");

  const handleVisibilityToggle = (option: string) => {
    const current = profileVisibility;
    if (current.includes(option)) {
      form.setValue("profileVisibility", current.filter(item => item !== option));
    } else {
      form.setValue("profileVisibility", [...current, option]);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Tell Us About You! 👋</h3>
      <p className="text-muted-foreground">Help us get to know you better with some basic information.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span className="font-bold">1.</span> Full Name</FormLabel>
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
              <FormLabel><span className="font-bold">2.</span> Age</FormLabel>
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
              <FormLabel><span className="font-bold">3.</span> Gender</FormLabel>
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

      {/* Privacy Section */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="profileVisibility"
          render={() => (
            <FormItem>
              <FormLabel className="text-base"><span className="font-bold">4.</span> Due to privacy issues, you can select who can see your profile</FormLabel>
              <FormDescription>Only show my profile to:</FormDescription>
              <div className="space-y-2 mt-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nationality"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span className="font-bold">5.</span> Nationality</FormLabel>
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
              <FormLabel><span className="font-bold">6.</span> Primary Language</FormLabel>
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
              <FormLabel><span className="font-bold">7.</span> Ethnicity</FormLabel>
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
        
        <FormField
          control={form.control}
          name="religion"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span className="font-bold">8.</span> Religion</FormLabel>
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
        
        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span className="font-bold">9.</span> Occupation</FormLabel>
              <FormControl>
                <Input placeholder="Enter your occupation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
      </div>

      {/* Work Schedule Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Work Schedule</h4>
        
        <FormField
          control={form.control}
          name="workLocation"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel><span className="font-bold">10.</span> Do you work from home or go to an office?</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
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
              <FormLabel><span className="font-bold">11.</span> What's your typical work schedule?</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
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

      {/* Dietary Preferences Section */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="diet"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel><span className="font-bold">12.</span> Dietary Preferences</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span className="font-bold">13.</span> Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span className="font-bold">14.</span> Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="linkedinProfile"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span className="font-bold">15.</span> LinkedIn Profile (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter your LinkedIn URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
