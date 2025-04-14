
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
  console.log("AccordionSections rendering with profileData:", profileData);
  
  // Ensure profileData is not null
  const safeProfileData = profileData || {};
  
  return (
    <Accordion 
      type="multiple" 
      value={expandedSections} 
      onValueChange={setExpandedSections}
      className="w-full"
    >
      <AboutMeSection
        expandedSections={expandedSections}
        profileData={safeProfileData}
        activeAboutMeTab={activeAboutMeTab}
        setActiveAboutMeTab={setActiveAboutMeTab}
        handleSaveProfile={handleSaveProfile}
      />

      <IdealRoommateSection
        expandedSections={expandedSections}
        profileData={safeProfileData}
        activeIdealRoommateTab={activeIdealRoommateTab}
        setActiveIdealRoommateTab={setActiveIdealRoommateTab}
        handleSaveProfile={handleSaveProfile}
      />

      <FutureHousingPlanSection
        expandedSections={expandedSections}
        profileData={safeProfileData}
      />

      <AIAssistantSection
        expandedSections={expandedSections}
        onFindMatch={handleFindMatch}
        profileData={safeProfileData}
      />
    </Accordion>
  );
}
