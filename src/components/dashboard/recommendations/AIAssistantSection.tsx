
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { ChatInterface } from "./chat/ChatInterface";
import { ProfileFormValues } from "@/types/profile";

interface AIAssistantSectionProps {
  profileData: Partial<ProfileFormValues> | null;
  isLoading?: boolean;
}

export function AIAssistantSection({ profileData, isLoading = false }: AIAssistantSectionProps) {
  // Create a summary of the user's profile for the AI assistant
  const getProfileSummary = () => {
    if (!profileData) return "No profile data available yet.";
    
    const summary = [];
    
    // Basic info
    if (profileData.fullName) summary.push(`Name: ${profileData.fullName}`);
    if (profileData.age) summary.push(`Age: ${profileData.age}`);
    if (profileData.gender) summary.push(`Gender: ${profileData.gender}`);
    if (profileData.occupation) summary.push(`Occupation: ${profileData.occupation}`);
    
    // Demographics
    if (profileData.nationality) summary.push(`Nationality: ${profileData.nationality}`);
    if (profileData.language) summary.push(`Language: ${profileData.language}`);
    if (profileData.ethnicity) summary.push(`Ethnicity: ${profileData.ethnicity}`);
    if (profileData.religion) summary.push(`Religion: ${profileData.religion}`);
    
    // Housing preferences
    if (profileData.preferredLocation && profileData.preferredLocation.length > 0) {
      summary.push(`Preferred locations: ${profileData.preferredLocation.join(", ")}`);
    }
    if (profileData.budgetRange) {
      summary.push(`Budget: $${profileData.budgetRange[0]} - $${profileData.budgetRange[1]}`);
    }
    if (profileData.housingType) summary.push(`Housing type: ${profileData.housingType}`);
    if (profileData.livingSpace) summary.push(`Living space: ${profileData.livingSpace}`);
    
    // Lifestyle
    if (profileData.smoking !== undefined) summary.push(`Smoker: ${profileData.smoking ? "Yes" : "No"}`);
    if (profileData.livesWithSmokers !== undefined) {
      summary.push(`Comfortable with smokers: ${profileData.livesWithSmokers ? "Yes" : "No"}`);
    }
    if (profileData.hasPets !== undefined) summary.push(`Has pets: ${profileData.hasPets ? "Yes" : "No"}`);
    if (profileData.petType) summary.push(`Pet type: ${profileData.petType}`);
    if (profileData.workLocation) summary.push(`Work location: ${profileData.workLocation}`);
    if (profileData.workSchedule) summary.push(`Work schedule: ${profileData.workSchedule}`);
    if (profileData.diet) summary.push(`Diet: ${profileData.diet}`);
    
    // Hobbies
    if (profileData.hobbies && profileData.hobbies.length > 0) {
      summary.push(`Hobbies: ${profileData.hobbies.join(", ")}`);
    }
    
    // Roommate preferences
    if (profileData.genderPreference && profileData.genderPreference.length > 0) {
      summary.push(`Preferred roommate gender: ${profileData.genderPreference.join(", ")}`);
    }
    if (profileData.nationalityPreference) {
      summary.push(`Nationality preference: ${profileData.nationalityPreference}`);
    }
    if (profileData.languagePreference) {
      summary.push(`Language preference: ${profileData.languagePreference}`);
    }
    if (profileData.occupationPreference) {
      summary.push(`Has occupation preference: ${profileData.occupationPreference ? "Yes" : "No"}`);
    }
    if (profileData.workSchedulePreference) {
      summary.push(`Work schedule preference: ${profileData.workSchedulePreference}`);
    }
    if (profileData.roommateHobbies && profileData.roommateHobbies.length > 0) {
      summary.push(`Preferred roommate hobbies: ${profileData.roommateHobbies.join(", ")}`);
    }
    if (profileData.rentOption) {
      summary.push(`Rent option: ${profileData.rentOption}`);
    }
    
    return summary.length > 0 ? summary.join("\n") : "Profile information is incomplete.";
  };

  return (
    <AccordionItem value="ai-assistant" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span className="text-xl font-semibold">AI Roommate Assistant</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardContent className="p-4">
            <ChatInterface 
              profileSummary={getProfileSummary()}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
