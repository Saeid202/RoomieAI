
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface AIAssistantSectionProps {
  expandedSections: string[];
}

export function AIAssistantSection({ expandedSections }: AIAssistantSectionProps) {
  return (
    <AccordionItem value="ai-assistant" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span className="text-xl font-semibold">AI Match Assistant</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800 mb-2">
                  How our AI helps you find your perfect match
                </h3>
                <p className="text-gray-700">
                  Our intelligent matching system analyzes your preferences, lifestyle, and habits to find roommates that are truly compatible with you. We go beyond just basic preferences to understand your living style.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Need to add anything else?
                </h3>
                <p className="text-gray-700">
                  Is there anything specific you're looking for in a roommate that we didn't ask? Tell us below and we'll consider it in our matching algorithm.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Chat with our AI Assistant
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  Find My Matches Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
