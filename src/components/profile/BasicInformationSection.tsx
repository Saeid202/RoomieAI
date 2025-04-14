
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";

interface BasicInformationSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function BasicInformationSection({ form }: BasicInformationSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="fullName">Full Name</FormLabel>
            <FormControl>
              <Input 
                id="fullName"
                placeholder="Enter your full name" 
                {...field} 
                autoComplete="name"
              />
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
            <FormLabel htmlFor="age">Age</FormLabel>
            <FormControl>
              <Input 
                id="age"
                type="number" 
                placeholder="Your age" 
                {...field} 
                min="18" 
                autoComplete="off"
              />
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
            <FormLabel htmlFor="gender">Gender (Optional)</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              This information is optional and helps find compatible roommates
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>
            <FormControl>
              <Input 
                id="phoneNumber"
                placeholder="Your phone number" 
                {...field} 
                autoComplete="tel"
              />
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
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <FormControl>
              <Input 
                id="email"
                type="email" 
                placeholder="Your email address" 
                {...field} 
                autoComplete="email"
              />
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
            <FormLabel htmlFor="linkedinProfile">LinkedIn Profile (Optional)</FormLabel>
            <FormControl>
              <Input 
                id="linkedinProfile"
                placeholder="https://linkedin.com/in/yourprofile" 
                {...field} 
                autoComplete="url"
              />
            </FormControl>
            <FormDescription>
              Add your LinkedIn link for better roommate compatibility
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
