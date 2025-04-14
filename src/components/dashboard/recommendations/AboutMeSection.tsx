
import { useState } from "react";
import { User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import { BasicInformationSection } from "@/components/profile/BasicInformationSection";
import { HousingPreferencesSection } from "@/components/profile/HousingPreferencesSection";
import { LeaseTermsSection } from "@/components/profile/LeaseTermsSection";
import { LifestyleHabitsSection } from "@/components/profile/LifestyleHabitsSection";
import { WorkSleepScheduleSection } from "@/components/profile/WorkSleepScheduleSection";
import { SocialPreferencesSection } from "@/components/profile/SocialPreferencesSection";
import { CleanlinessSection } from "@/components/profile/CleanlinessSection";
import { CookingMealsSection } from "@/components/profile/CookingMealsSection";
import { useFormUtilities } from "@/hooks/useFormUtilities";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/types/profile";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { hobbiesList } from "@/utils/formSteps";
import { useToast } from "@/hooks/use-toast";

interface AboutMeSectionProps {
  expandedSections: string[];
  profileData: Partial<ProfileFormValues> | null;
  activeAboutMeTab: string;
  setActiveAboutMeTab: (value: string) => void;
  handleSaveProfile: (formData: ProfileFormValues) => void;
}

// Define the tabs for the About Me section
const AboutMeTabs = [
  { id: "personal-info", label: "1️⃣ Personal Info", icon: User },
  { id: "housing", label: "2️⃣ Housing", icon: User },
  { id: "lifestyle", label: "3️⃣ Lifestyle", icon: User },
  { id: "social-cleaning", label: "4️⃣ Social & Cleaning", icon: User },
];

export function AboutMeSection({ 
  expandedSections, 
  profileData, 
  activeAboutMeTab, 
  setActiveAboutMeTab,
  handleSaveProfile
}: AboutMeSectionProps) {
  const { toast } = useToast();
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
    ...profileData
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultFormValues,
  });

  const { handleHobbyToggle } = useFormUtilities(form);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      console.log("About Me form data to save:", data);
      await handleSaveProfile(data);
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
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
              <TabsList className="w-full grid grid-cols-4">
                {AboutMeTabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="inline md:hidden">{tab.id.split('-')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                  <TabsContent value="personal-info">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Tell us about yourself! 😊</h3>
                      <p className="text-muted-foreground">Let's get to know the amazing human behind the screen! No pressure, we're just nosy. 🧐</p>
                      <BasicInformationSection form={form} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="housing">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Home Sweet Home? 🏠</h3>
                      <p className="text-muted-foreground">Tell us about your dream pad! Mansion or shoebox, we don't judge (much). 😉</p>
                      <Tabs defaultValue="housing">
                        <TabsList>
                          <TabsTrigger value="housing">Housing Preferences</TabsTrigger>
                          <TabsTrigger value="lease">Lease Terms</TabsTrigger>
                        </TabsList>
                        <TabsContent value="housing">
                          <HousingPreferencesSection form={form} />
                        </TabsContent>
                        <TabsContent value="lease">
                          <LeaseTermsSection form={form} />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="lifestyle">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Living La Vida Loca? 🎭</h3>
                      <p className="text-muted-foreground">Early bird or night owl? Party animal or Netflix champion? Spill the beans! 🦉</p>
                      <Tabs defaultValue="lifestyle">
                        <TabsList>
                          <TabsTrigger value="lifestyle">Lifestyle & Habits</TabsTrigger>
                          <TabsTrigger value="schedule">Work & Sleep</TabsTrigger>
                        </TabsList>
                        <TabsContent value="lifestyle">
                          <LifestyleHabitsSection 
                            form={form} 
                            handleHobbyToggle={handleHobbyToggle} 
                            hobbiesList={hobbiesList} 
                          />
                        </TabsContent>
                        <TabsContent value="schedule">
                          <WorkSleepScheduleSection form={form} />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="social-cleaning">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Clean Freak or Chaos Creator? 🧹</h3>
                      <p className="text-muted-foreground">Do you see dust bunnies as pets or enemies? Let's dish the dirt on your cleaning habits! 🧼</p>
                      <Tabs defaultValue="cleanliness">
                        <TabsList>
                          <TabsTrigger value="cleanliness">Cleanliness</TabsTrigger>
                          <TabsTrigger value="social">Social</TabsTrigger>
                          <TabsTrigger value="cooking">Cooking</TabsTrigger>
                        </TabsList>
                        <TabsContent value="cleanliness">
                          <CleanlinessSection form={form} />
                        </TabsContent>
                        <TabsContent value="social">
                          <SocialPreferencesSection form={form} />
                        </TabsContent>
                        <TabsContent value="cooking">
                          <CookingMealsSection form={form} />
                        </TabsContent>
                      </Tabs>
                    </div>
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
