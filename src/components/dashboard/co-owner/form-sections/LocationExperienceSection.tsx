
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CoOwnerFormValues } from "../types";

interface SectionProps {
  form: UseFormReturn<CoOwnerFormValues>;
}

export function LocationExperienceSection({ form }: SectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="preferredLocation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Location</FormLabel>
            <FormControl>
              <Input placeholder="San Francisco, CA" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="coOwnershipExperience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Co-Ownership Experience</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Some">Some</SelectItem>
                <SelectItem value="Experienced">Experienced</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
