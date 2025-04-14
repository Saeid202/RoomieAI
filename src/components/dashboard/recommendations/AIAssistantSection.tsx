
import { Wand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useState } from "react";

interface AIAssistantSectionProps {
  expandedSections: string[];
  onFindMatch: () => Promise<void>;
}

export function AIAssistantSection({ expandedSections, onFindMatch }: AIAssistantSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFindMatch = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onFindMatch();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccordionItem value="ai-assistant" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <Wand className="h-5 w-5" />
          <span className="text-xl font-semibold">AI Matching Assistant</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">Ready to Find Your Match? 🔍</h3>
              <p className="text-muted-foreground">
                Our AI will analyze your profile and preferences to find the most compatible roommates.
              </p>
              
              <div className="max-w-md mx-auto bg-accent/20 rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-2">Before we search:</h4>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Fill out your <strong>About Me</strong> information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Complete your <strong>Ideal Roommate</strong> preferences</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Make sure to <strong>Save</strong> all your changes</span>
                  </li>
                </ul>
              </div>
              
              <Button 
                onClick={handleFindMatch} 
                disabled={isLoading}
                className="bg-gradient-to-r from-roomie-purple to-roomie-accent hover:opacity-90 text-white font-medium px-8 py-6"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finding Your Match...
                  </div>
                ) : (
                  <>Find My Match</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
