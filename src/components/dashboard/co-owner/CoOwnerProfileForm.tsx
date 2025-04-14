
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
import { supabase } from "@/integrations/supabase/client";

interface CoOwnerProfileFormProps {
  initialData?: Partial<CoOwnerFormValues> | null;
  onSave?: (data: CoOwnerFormValues) => Promise<any>;
}

export function CoOwnerProfileForm({ initialData, onSave }: CoOwnerProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

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

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('co_owner')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          // Map database fields to form fields
          const formData = {
            fullName: data.full_name || "",
            age: data.age || "",
            email: data.email || "",
            phoneNumber: data.phone_number || "",
            occupation: data.occupation || "",
            preferredLocation: data.preferred_location || "",
            investmentCapacity: data.investment_capacity || [100000, 500000],
            investmentTimeline: data.investment_timeline || "0-6 months",
            propertyType: data.property_type || "Any",
            coOwnershipExperience: data.co_ownership_experience || "None",
          };

          Object.keys(formData).forEach(key => {
            form.setValue(key as any, formData[key]);
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile data",
          variant: "destructive",
        });
      }
    };

    loadProfile();
  }, [user, form, toast]);

  async function onSubmit(values: CoOwnerFormValues) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Form submitted with values:", values);
      
      const profileData = {
        user_id: user.id,
        full_name: values.fullName,
        age: values.age,
        email: values.email,
        phone_number: values.phoneNumber,
        occupation: values.occupation,
        preferred_location: values.preferredLocation,
        investment_capacity: values.investmentCapacity,
        investment_timeline: values.investmentTimeline,
        property_type: values.propertyType,
        co_ownership_experience: values.coOwnershipExperience,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('co_owner')
        .upsert(profileData)
        .select();

      if (error) throw error;

      if (onSave) {
        await onSave(values);
      }

      toast({
        title: "Success",
        description: "Your co-owner profile has been saved",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
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
