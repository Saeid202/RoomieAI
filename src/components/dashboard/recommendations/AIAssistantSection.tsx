import { Card, CardContent } from "@/components/ui/card";
import { ChatInterface } from "./chat/ChatInterface";
import { ProfileFormValues } from "@/types/profile";
import { createProfileSummary } from "@/utils/profileDataMappers";

interface AIAssistantSectionProps {
  profileData: Partial<ProfileFormValues> | null;
  isLoading?: boolean;
}

export function AIAssistantSection({ profileData, isLoading = false }: AIAssistantSectionProps) {
  // Create a profile summary for the chat interface
  const profileSummary = profileData ? createProfileSummary(profileData) : "";

  return (
    <Card className="border rounded-lg">
      <CardContent className="p-0">
        <ChatInterface 
          matchingProfileData={profileSummary}
        />
      </CardContent>
    </Card>
  );
}
