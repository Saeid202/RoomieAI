
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { InvestmentSection } from "./form-sections/InvestmentSection";
import { LocationExperienceSection } from "./form-sections/LocationExperienceSection";
import { CoOwnerFormValues, coOwnerFormSchema } from "./types";

interface CoOwnerProfileFormProps {
  initialData?: Partial<CoOwnerFormValues> | null;
  onSave?: (data: CoOwnerFormValues) => Promise<any>;
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
        <h3 className="text-lg font-medium">Personal Information</h3>
        <PersonalInfoSection form={form} />
        
        <h3 className="text-lg font-medium mt-8">Investment Details</h3>
        <InvestmentSection form={form} />
        
        <h3 className="text-lg font-medium mt-8">Location & Experience</h3>
        <LocationExperienceSection form={form} />

        <Button type="submit" className="w-full mt-8" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Co-Owner Profile"}
        </Button>
      </form>
    </Form>
  );
}
