import { useState } from "react";
import { User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import ProfileForm from "@/components/ProfileForm";

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
              {AboutMeTabs.map(tab => (
                <TabsContent key={tab.id} value={tab.id} className="pt-4">
                  {renderFormContentForAboutMe(tab.id, profileData, handleSaveProfile)}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}

// Helper function to render the appropriate form content based on the selected tab
function renderFormContentForAboutMe(
  tabId: string, 
  profileData: Partial<ProfileFormValues> | null,
  handleSaveProfile: (formData: ProfileFormValues) => void
) {
  if (!profileData) return <div>Please complete your profile</div>;
  
  // We'll keep using existing form components, but showing only relevant sections
  switch (tabId) {
    case "personal-info":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Tell us about yourself! 😊</h3>
          <p className="text-muted-foreground">Let's get to know the amazing human behind the screen! No pressure, we're just nosy. 🧐</p>
          <ProfileForm 
            initialData={profileData} 
            onSave={handleSaveProfile} 
          />
        </div>
      );
    case "housing":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Home Sweet Home? 🏠</h3>
          <p className="text-muted-foreground">Tell us about your dream pad! Mansion or shoebox, we don't judge (much). 😉</p>
          <ProfileForm 
            initialData={profileData} 
            onSave={handleSaveProfile} 
          />
        </div>
      );
    case "lifestyle":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Living La Vida Loca? 🎭</h3>
          <p className="text-muted-foreground">Early bird or night owl? Party animal or Netflix champion? Spill the beans! 🦉</p>
          <ProfileForm 
            initialData={profileData} 
            onSave={handleSaveProfile} 
          />
        </div>
      );
    case "social-cleaning":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Clean Freak or Chaos Creator? 🧹</h3>
          <p className="text-muted-foreground">Do you see dust bunnies as pets or enemies? Let's dish the dirt on your cleaning habits! 🧼</p>
          <ProfileForm 
            initialData={profileData} 
            onSave={handleSaveProfile} 
          />
        </div>
      );
    default:
      return <div>Select a tab to continue</div>;
  }
}
