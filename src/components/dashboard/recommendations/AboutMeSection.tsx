
import { User } from "lucide-react";
import { ProfileFormValues } from "@/types/profile";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/types/profile";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AboutMeTabs } from "./about-me/AboutMeTabs";
import { PersonalInfoTab } from "./about-me/PersonalInfoTab";
import { HousingLifestyleTab } from "./about-me/HousingLifestyleTab";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AboutMeSectionProps {
  profileData: Partial<ProfileFormValues> | null;
  isLoading?: boolean;
  onSaveProfile?: (formData: ProfileFormValues) => Promise<void>;
}

export function AboutMeSection({ 
  profileData,
  isLoading = false,
  onSaveProfile
}: AboutMeSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeAboutMeTab, setActiveAboutMeTab] = useState("personal-info");
  const { toast } = useToast();
  
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
    moveInDateEnd: new Date(),
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
    // Ideal roommate defaults
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { ...defaultFormValues, ...profileData },
  });

  useEffect(() => {
    if (profileData) {
      console.log("Updating AboutMeSection form with profile data:", profileData);
      form.reset({ ...defaultFormValues, ...profileData });
    }
  }, [profileData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      console.log("About Me form data to save:", data);
      
      if (onSaveProfile) {
        await onSaveProfile(data);
        toast({
          title: "Profile saved",
          description: "Your profile has been saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      });
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
                  
                  <TabsContent value="housing-lifestyle">
                    <HousingLifestyleTab form={form} />
                  </TabsContent>
                  
                   <div className="flex justify-between items-center">
                     <Button 
                       type="button" 
                       variant="outline"
                       onClick={() => setActiveAboutMeTab("personal-info")}
                       disabled={activeAboutMeTab === "personal-info"}
                     >
                       Back
                     </Button>
                     
                     <Button type="submit" disabled={isSaving}>
                       {isSaving ? "Saving..." : "Save Profile"}
                     </Button>
                     
                     <Button 
                       type="button" 
                       onClick={() => setActiveAboutMeTab("housing-lifestyle")}
                       disabled={activeAboutMeTab === "housing-lifestyle"}
                     >
                       Next
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
