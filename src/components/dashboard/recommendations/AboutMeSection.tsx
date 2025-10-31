import { User } from "lucide-react";
import { ProfileFormValues } from "@/types/profile";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/types/profile";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AboutMeStepper } from "./about-me/AboutMeSection/AboutMeStepper";

interface AboutMeSectionProps {
  profileData: Partial<ProfileFormValues> | null;
  isLoading?: boolean;
  onSaveProfile?: (formData: ProfileFormValues) => Promise<void>;
}

const defaultFormValues: Partial<ProfileFormValues> = {
  fullName: "",
  age: "",
  gender: "",
  email: "",
  phoneNumber: "",
  nationality: "",
  language: "",
  ethnicity: "",
  religion: "",
  occupation: "",
  preferredLocation: [],
  budgetRange: [800, 1500],
  moveInDateStart: new Date(),
  housingType: "apartment",
  livingSpace: "privateRoom",
  smoking: false,
  livesWithSmokers: false,
  hasPets: false,
  workLocation: "remote",
  workSchedule: "dayShift",
  hobbies: [],
  diet: "noPreference",
  dietOther: "",
  profileVisibility: [],
  genderPreference: [],
  nationalityPreference: "noPreference",
  languagePreference: "noPreference",
  ethnicityPreference: "noPreference",
  religionPreference: "noPreference",
  occupationPreference: false,
  workSchedulePreference: "noPreference",
  roommateHobbies: [],
  rentOption: "findTogether",
};

export function AboutMeSection({
  profileData,
  isLoading = false,
  onSaveProfile
}: AboutMeSectionProps) {
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { ...defaultFormValues, ...profileData },
    shouldUnregister: false, // Keep field values when unmounted during step navigation
  });

  useEffect(() => {
    if (profileData) {
      const mergedData = { ...defaultFormValues, ...profileData };
      form.reset(mergedData);
    } else {
      form.reset(defaultFormValues);
    }
  }, [profileData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!onSaveProfile) {
      console.error("onSaveProfile function is not provided");
      return;
    }
    try {
      await onSaveProfile(data)
      toast({
        title: "Profile saved",
        description: "Your profile has been saved successfully",
      });
    } catch (error) {
      // FIXME: error object is undefined. since it is not passed from the hook
      toast({
        title: "Error saving profile",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const onInvalid = () => {
    const errors = form.formState.errors;
    const errorMessages = Object.entries(errors)
      .map(([field, error]) => `${field}: ${error?.message}`)
      .join(", ");

    toast({
      title: "Validation Error",
      description: errorMessages || "Please fix the errors in the form before saving.",
      variant: "destructive",
    });
  };

  return (
    <AccordionItem value="about-me" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <span className="text-xl font-semibold">About Me</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardContent className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                <AboutMeStepper />

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    size="lg"
                  >
                    {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}