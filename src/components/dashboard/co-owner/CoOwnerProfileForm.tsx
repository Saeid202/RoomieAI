
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { InvestmentSection } from "./form-sections/InvestmentSection";
import { LocationExperienceSection } from "./form-sections/LocationExperienceSection";
import { CoOwnerFormValues, coOwnerSchema } from "./types";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface CoOwnerProfileFormProps {
  initialData?: Partial<CoOwnerFormValues> | null;
  onSave?: (data: CoOwnerFormValues) => Promise<any>;
}

export function CoOwnerProfileForm({ initialData, onSave }: CoOwnerProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if no user is found
  useEffect(() => {
    if (user === null) {
      console.log("No user found, redirecting to login");
      toast({
        title: "Authentication Required",
        description: "Please login to access this feature",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, navigate, toast]);

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
    ...initialData
  };

  const form = useForm<CoOwnerFormValues>({
    resolver: zodResolver(coOwnerSchema),
    defaultValues,
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        form.setValue(key as any, initialData[key as keyof CoOwnerFormValues]);
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: CoOwnerFormValues) {
    setFormError(null);
    
    if (!user) {
      const errorMsg = "You must be logged in to save your profile";
      setFormError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Form submitted with values:", values);
      
      if (onSave) {
        await onSave(values);
      }

    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setFormError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to save your profile: " + errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      {formError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoSection form={form} />
        <InvestmentSection form={form} />
        <LocationExperienceSection form={form} />

        <Button type="submit" className="w-full mt-8" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Co-Owner Profile"}
        </Button>
      </form>
    </Form>
  );
}
