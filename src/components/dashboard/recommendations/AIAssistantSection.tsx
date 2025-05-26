
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
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
              matchingProfileData={profileData}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
