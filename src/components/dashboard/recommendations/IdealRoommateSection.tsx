
import { Heart, Settings, Sofa, Ban, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import ProfileForm from "@/components/ProfileForm";

interface IdealRoommateSectionProps {
  expandedSections: string[];
  profileData: Partial<ProfileFormValues> | null;
  activeIdealRoommateTab: string;
  setActiveIdealRoommateTab: (value: string) => void;
  handleSaveProfile: (formData: ProfileFormValues) => void;
}

// Define the tabs for the Ideal Roommate section
const IdealRoommateTabs = [
  { id: "preferences", label: "1️⃣ Preferences", icon: Settings },
  { id: "lifestyle-match", label: "2️⃣ Lifestyle Match", icon: Heart },
  { id: "house-habits", label: "3️⃣ House Habits", icon: Sofa },
  { id: "deal-breakers", label: "4️⃣ Deal Breakers", icon: Ban }
];

export function IdealRoommateSection({ 
  expandedSections, 
  profileData, 
  activeIdealRoommateTab, 
  setActiveIdealRoommateTab,
  handleSaveProfile
}: IdealRoommateSectionProps) {
  return (
    <AccordionItem value="ideal-roommate" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="text-xl font-semibold">My Ideal Roommate</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardContent className="p-4">
            <Tabs value={activeIdealRoommateTab} onValueChange={setActiveIdealRoommateTab}>
              <TabsList className="w-full grid grid-cols-4">
                {IdealRoommateTabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="inline md:hidden">{tab.id.split('-')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {IdealRoommateTabs.map(tab => (
                <TabsContent key={tab.id} value={tab.id} className="pt-4">
                  {renderFormContentForIdealRoommate(tab.id, profileData, handleSaveProfile)}
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
function renderFormContentForIdealRoommate(
  tabId: string, 
  profileData: Partial<ProfileFormValues> | null,
  handleSaveProfile: (formData: ProfileFormValues) => void
) {
  if (!profileData) return <div>Please complete your profile</div>;
  
  switch (tabId) {
    case "preferences":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Your Dream Roomie! 🌈</h3>
          <p className="text-muted-foreground">Seeking a neat freak? A fellow pizza enthusiast? A plant parent? Let's find your perfect match! 🔍</p>
          <ProfileForm 
            initialData={profileData} 
            onSave={handleSaveProfile} 
          />
        </div>
      );
    case "lifestyle-match":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Lifestyle Twins or Opposites? 🎭</h3>
          <p className="text-muted-foreground">Does your ideal roomie need to match your wild party schedule or balance it out? No wrong answers! 🎉</p>
          <ProfileForm 
            initialData={profileData} 
            onSave={handleSaveProfile} 
          />
        </div>
      );
    case "house-habits":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">House Rules & Habits! 🏡</h3>
          <p className="text-muted-foreground">Seeking someone who shares your "dishes don't wash themselves" philosophy? Let's set some ground rules! 📝</p>
          <ProfileForm 
            initialData={profileData} 
            onSave={handleSaveProfile} 
          />
        </div>
      );
    case "deal-breakers":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Absolutely Not! 🙅‍♂️</h3>
          <p className="text-muted-foreground">What crosses the line? Midnight drum practice? Pineapple on pizza? We won't judge (much)! 🍍</p>
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
