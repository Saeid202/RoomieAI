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
  children?: React.ReactNode;
}

export function TabsSection({
  activeTab,
  expandedSections,
  setExpandedSections,
  handleTabChange,
  profileData,
  onSaveProfile,
  children
}: TabsSectionProps) {
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="hidden">
        <TabsTrigger value="matches">View Matches</TabsTrigger>
        <TabsTrigger value="about-me">About Me</TabsTrigger>
        <TabsTrigger value="ideal-roommate">Ideal Roommate</TabsTrigger>
      </TabsList>

      <TabsContent value="matches">
        {children}
      </TabsContent>

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
