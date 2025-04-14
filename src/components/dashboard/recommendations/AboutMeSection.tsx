
import { User } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/types/profile";
import { useState, useEffect } from "react";
import { AboutMeTabs } from "./about-me/AboutMeTabs";
import { PersonalInfoTab } from "./about-me/PersonalInfoTab";
import { HousingTab } from "./about-me/HousingTab";
import { LifestyleTab } from "./about-me/LifestyleTab";
import { SocialCleaningTab } from "./about-me/SocialCleaningTab";

interface AboutMeSectionProps {
  expandedSections: string[];
  profileData: Partial<ProfileFormValues> | null;
  activeAboutMeTab: string;
  setActiveAboutMeTab: (value: string) => void;
  handleSaveProfile: (formData: ProfileFormValues) => void;
}

export function AboutMeSection({ 
  expandedSections, 
  profileData, 
  activeAboutMeTab, 
  setActiveAboutMeTab,
  handleSaveProfile
}: AboutMeSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Create a default empty form value to prevent null errors
  const defaultFormValues: Partial<ProfileFormValues> = {
    fullName: "",
    age: "",
    gender: "",
    email: "",
    phoneNumber: "",
    budgetRange: [800, 1500],
    preferredLocation: "",
    moveInDate: new Date(),
    housingType: "apartment",
    livingSpace: "privateRoom",
    smoking: false,
    livesWithSmokers: false,
    hasPets: false,
    petPreference: "noPets",
    workLocation: "remote",
    dailyRoutine: "mixed",
    sleepSchedule: "Regular schedule",
    overnightGuests: "occasionally",
    cleanliness: "somewhatTidy",
    cleaningFrequency: "weekly",
    socialLevel: "balanced",
    guestsOver: "occasionally",
    familyOver: "occasionally",
    atmosphere: "balanced",
    hostingFriends: "occasionally",
    diet: "omnivore",
    cookingSharing: "separate",
    stayDuration: "sixMonths",
    leaseTerm: "longTerm",
    roommateGenderPreference: "noPreference",
    roommateAgePreference: "noAgePreference",
    roommateLifestylePreference: "noLifestylePreference",
    hobbies: [],
    importantRoommateTraits: [],
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { ...defaultFormValues, ...profileData },
  });

  // Update form when profileData changes
  useEffect(() => {
    if (profileData) {
      console.log("Updating AboutMeSection form with profile data:", profileData);
      // Reset the form with the merged values of defaultFormValues and profileData
      form.reset({ ...defaultFormValues, ...profileData });
    }
  }, [profileData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      console.log("About Me form data to save:", data);
      
      // Make sure data has complete form values, fallback to defaults for required fields
      const completeData: ProfileFormValues = {
        ...defaultFormValues,
        ...data,
      } as ProfileFormValues;
      
      await handleSaveProfile(completeData);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
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
            <Tabs value={activeAboutMeTab} onValueChange={setActiveAboutMeTab}>
              <AboutMeTabs />
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                  <TabsContent value="personal-info">
                    <PersonalInfoTab form={form} />
                  </TabsContent>
                  
                  <TabsContent value="housing">
                    <HousingTab form={form} />
                  </TabsContent>
                  
                  <TabsContent value="lifestyle">
                    <LifestyleTab form={form} />
                  </TabsContent>
                  
                  <TabsContent value="social-cleaning">
                    <SocialCleaningTab form={form} />
                  </TabsContent>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
