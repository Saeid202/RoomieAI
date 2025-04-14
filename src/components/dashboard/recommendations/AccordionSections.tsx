
import { Accordion } from "@/components/ui/accordion";
import { AboutMeSection } from "./AboutMeSection";
import { IdealRoommateSection } from "./IdealRoommateSection";
import { AIAssistantSection } from "./AIAssistantSection";
import { FutureHousingPlanSection } from "./FutureHousingPlanSection";
import { ProfileFormValues } from "@/types/profile";

interface AccordionSectionsProps {
  expandedSections: string[];
  setExpandedSections: (value: string[]) => void;
  profileData: Partial<ProfileFormValues> | null;
  activeAboutMeTab: string;
  setActiveAboutMeTab: (value: string) => void;
  activeIdealRoommateTab: string;
  setActiveIdealRoommateTab: (value: string) => void;
  handleSaveProfile: (formData: ProfileFormValues) => Promise<void>;
  handleFindMatch: () => Promise<void>;
}

export function AccordionSections({
  expandedSections,
  setExpandedSections,
  profileData,
  activeAboutMeTab,
  setActiveAboutMeTab,
  activeIdealRoommateTab,
  setActiveIdealRoommateTab,
  handleSaveProfile,
  handleFindMatch,
}: AccordionSectionsProps) {
  return (
    <Accordion 
      type="multiple" 
      value={expandedSections} 
      onValueChange={setExpandedSections}
      className="w-full"
    >
      <AboutMeSection
        expandedSections={expandedSections}
        profileData={profileData}
        activeAboutMeTab={activeAboutMeTab}
        setActiveAboutMeTab={setActiveAboutMeTab}
        handleSaveProfile={handleSaveProfile}
      />

      <IdealRoommateSection
        expandedSections={expandedSections}
        profileData={profileData}
        activeIdealRoommateTab={activeIdealRoommateTab}
        setActiveIdealRoommateTab={setActiveIdealRoommateTab}
        handleSaveProfile={handleSaveProfile}
      />

      <FutureHousingPlanSection
        expandedSections={expandedSections}
        profileData={profileData}
      />

      <AIAssistantSection
        expandedSections={expandedSections}
        onFindMatch={handleFindMatch}
        profileData={profileData}
      />
    </Accordion>
  );
}
