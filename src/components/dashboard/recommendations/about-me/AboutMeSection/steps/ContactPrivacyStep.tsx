import { useFormContext } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function ContactPrivacyStep() {
  const form = useFormContext<ProfileFormValues>();
  const profileVisibility = form.watch("profileVisibility") || [];

  const handleVisibilityToggle = (option: string) => {
    const current = profileVisibility;
    if (current.includes(option)) {
      form.setValue("profileVisibility", current.filter(item => item !== option));
    } else {
      form.setValue("profileVisibility", [...current, option]);
    }
  };

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
}
