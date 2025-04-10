
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PreferenceSelector } from "./PreferenceSelector";
import { Users, Home, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { UserPreference } from "./types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState<UserPreference>(null);
  const [sectionsOpen, setSectionsOpen] = useState({
    roommate: true,
    coOwner: true,
    both: true
  });
  
  // Load the saved preference from localStorage if it exists
  useEffect(() => {
    const savedPreference = localStorage.getItem('userPreference') as UserPreference;
    if (savedPreference) {
      setActiveTab(savedPreference);
    }
  }, []);

  // Handle tab change and update localStorage
  const handleTabChange = (value: string) => {
    const preference = value as UserPreference;
    setActiveTab(preference);
    localStorage.setItem('userPreference', preference);
  };

  // Toggle section open/closed state
  const toggleSection = (section: string) => {
    setSectionsOpen({
      ...sectionsOpen,
      [section]: !sectionsOpen[section]
    });
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">My Profile</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">What are you looking for?</h2>
          <p className="text-gray-600 mb-6">
            Select your housing preference. You can change this at any time.
          </p>
          
          <Tabs 
            value={activeTab || "roommate"} 
            onValueChange={handleTabChange} 
            className="w-full"
          >
            <TabsList className="w-full mb-6 grid grid-cols-3">
              <TabsTrigger value="roommate" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Roommate</span>
              </TabsTrigger>
              <TabsTrigger value="co-owner" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Co-owner</span>
              </TabsTrigger>
              <TabsTrigger value="both" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Both</span>
              </TabsTrigger>
            </TabsList>
            
            <Accordion type="multiple" className="w-full" defaultValue={["roommate-section"]}>
              <TabsContent value="roommate" className="space-y-4">
                <AccordionItem value="roommate-section" className="border-none">
                  <AccordionTrigger className="py-4 px-6 bg-purple-50 rounded-t-lg hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-roomie-purple" />
                      <h3 className="text-lg font-medium">I'm looking for a roommate</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-1">
                    <PreferenceSelector defaultPreference="roommate" />
                  </AccordionContent>
                </AccordionItem>
              </TabsContent>
              
              <TabsContent value="co-owner" className="space-y-4">
                <AccordionItem value="coowner-section" className="border-none">
                  <AccordionTrigger className="py-4 px-6 bg-purple-50 rounded-t-lg hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-roomie-purple" />
                      <h3 className="text-lg font-medium">I'm looking for a co-owner</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-1">
                    <PreferenceSelector defaultPreference="co-owner" />
                  </AccordionContent>
                </AccordionItem>
              </TabsContent>
              
              <TabsContent value="both" className="space-y-4">
                <AccordionItem value="both-section" className="border-none">
                  <AccordionTrigger className="py-4 px-6 bg-purple-50 rounded-t-lg hover:no-underline">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-roomie-purple" />
                      <h3 className="text-lg font-medium">I'm interested in both options</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-1">
                    <PreferenceSelector defaultPreference="both" />
                  </AccordionContent>
                </AccordionItem>
              </TabsContent>
            </Accordion>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
