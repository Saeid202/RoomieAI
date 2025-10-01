import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { AboutMeSection } from "../AboutMeSection";
import { IdealRoommateSection } from "../IdealRoommateSection";
import { ChatInterface } from "../chat/ChatInterface";
import { ProfileFormValues } from "@/types/profile";

interface TabsSectionProps {
  activeTab: string;
  expandedSections: string[];
  setExpandedSections: (value: string[]) => void;
  handleTabChange: (value: string) => void;
  profileData: Partial<ProfileFormValues> | null;
  onSaveProfile: (formData: ProfileFormValues) => Promise<void>;
}

export function TabsSection({
  activeTab,
  expandedSections,
  setExpandedSections,
  handleTabChange,
  profileData,
  onSaveProfile,
}: TabsSectionProps) {
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-6 w-full grid grid-cols-2 gap-1 h-12 bg-muted/30 p-1 rounded-2xl">
        <TabsTrigger
          value="about-me"
          className="font-medium rounded-xl text-xs md:text-base bg-primary data-[state=active]:bg-primary px-1 text-primary-foreground data-[state=active]:text-primary-foreground opacity-80 data-[state=active]:opacity-100 transition-all duration-200"
        >
          About Me
        </TabsTrigger>
        <TabsTrigger
          value="ideal-roommate"
          className="font-medium rounded-xl text-xs md:text-base bg-primary data-[state=active]:bg-primary px-1 text-primary-foreground data-[state=active]:text-primary-foreground opacity-80 data-[state=active]:opacity-100 transition-all duration-200"
        >
          Ideal Roommate
        </TabsTrigger>
        {/* <TabsTrigger
          value="ai-assistant"
          className="font-medium rounded-xl text-xs md:text-base bg-primary data-[state=active]:bg-primary px-1 text-primary-foreground data-[state=active]:text-primary-foreground opacity-80 data-[state=active]:opacity-100 transition-all duration-200"
        >
          AI Assistant
        </TabsTrigger> */}
      </TabsList>

      <TabsContent value="about-me">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
        >
          <AboutMeSection
            profileData={profileData}
            onSaveProfile={onSaveProfile}
          />
        </Accordion>
      </TabsContent>

      <TabsContent value="ideal-roommate">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
        >
          <IdealRoommateSection
            profileData={profileData}
            onSaveProfile={onSaveProfile}
          />
        </Accordion>
      </TabsContent>

      <TabsContent value="ai-assistant">
        <ChatInterface matchingProfileData={profileData} />
      </TabsContent>
    </Tabs>
  );
}
