import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

// Define the schema for the co-owner profile form
const coOwnerFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 18, {
    message: "Age must be a number and at least 18",
  }),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  occupation: z.string().min(2, "Occupation is required"),
  investmentCapacity: z.array(z.number()).length(2),
  investmentTimeline: z.enum(["0-6 months", "6-12 months", "1-2 years", "2+ years"]),
  propertyType: z.enum(["Apartment", "House", "Townhouse", "Any"]),
  preferredLocation: z.string(),
  coOwnershipExperience: z.enum(["None", "Some", "Experienced"]),
});

type CoOwnerFormValues = z.infer<typeof coOwnerFormSchema>;

interface CoOwnerProfileFormProps {
  initialData?: Partial<CoOwnerFormValues>;
  onSave?: (data: CoOwnerFormValues) => Promise<void>;
}

export function CoOwnerProfileForm({ initialData, onSave }: CoOwnerProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default values for the form
  const defaultValues: Partial<CoOwnerFormValues> = {
    fullName: "",
    age: "",
    email: "",
    phoneNumber: "",
    occupation: "",
    investmentCapacity: [100000, 500000],
    investmentTimeline: "0-6 months",
    propertyType: "Any",
    preferredLocation: "",
    coOwnershipExperience: "None",
  };

  // Create form with merged values
  const form = useForm<CoOwnerFormValues>({
    resolver: zodResolver(coOwnerFormSchema),
    defaultValues: { ...defaultValues, ...initialData },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log("Updating form with initial data:", initialData);
      Object.keys(initialData).forEach(key => {
        const value = initialData[key];
        if (value !== undefined && value !== null) {
          console.log(`Setting form value for ${key}:`, value);
          form.setValue(key as any, value);
        }
      });
    }
  }, [form, initialData]);

  async function onSubmit(values: CoOwnerFormValues) {
    try {
      setIsSubmitting(true);
      console.log("Form submitted with values:", values);
      
      if (onSave) {
        console.log("Calling onSave with form values");
        await onSave(values);
        toast({
          title: "Profile saved",
          description: "Your co-owner profile has been updated successfully.",
        });
      } else {
        console.warn("No onSave function provided");
        toast({
          title: "Form submitted",
          description: "This is a preview. No data was saved.",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
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
                  <Input placeholder="30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupation</FormLabel>
              <FormControl>
                <Input placeholder="Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="investmentCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Capacity Range (USD)</FormLabel>
              <FormControl>
                <Slider
                  defaultValue={field.value}
                  max={1000000}
                  min={50000}
                  step={10000}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormDescription className="flex justify-between">
                <span>${field.value[0].toLocaleString()}</span>
                <span>${field.value[1].toLocaleString()}</span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="investmentTimeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investment Timeline</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timeline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0-6 months">0-6 months</SelectItem>
                    <SelectItem value="6-12 months">6-12 months</SelectItem>
                    <SelectItem value="1-2 years">1-2 years</SelectItem>
                    <SelectItem value="2+ years">2+ years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Any">Any</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Co-Owner Profile"}
        </Button>
      </form>
    </Form>
  );
}
