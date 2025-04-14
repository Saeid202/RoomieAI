
import React, { useState } from "react";
import { Clock } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileFormValues } from "@/types/profile";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { initialPlans, mockRecommendations } from "./mockData";
import { FutureHousingPlan, PlanRecommendation } from "./types";
import { PlansTab } from "./PlansTab";
import { RecommendationsTab } from "./RecommendationsTab";
import { MatchesTab } from "./MatchesTab";

interface FutureHousingPlanSectionProps {
  expandedSections: string[];
  profileData?: Partial<ProfileFormValues> | null;
}

export function FutureHousingPlanSection({ 
  expandedSections,
  profileData
}: FutureHousingPlanSectionProps) {
  const [plans, setPlans] = useState<FutureHousingPlan[]>(initialPlans);
  const [activeTab, setActiveTab] = useState<string>("plans");
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [recommendations, setRecommendations] = useState<PlanRecommendation[]>(mockRecommendations);
  const { showSuccess, showPlanMatch } = useToastNotifications();

  // New plan form state
  const [newPlan, setNewPlan] = useState<Partial<FutureHousingPlan>>({
    location: "",
    moveInDate: new Date(),
    flexibilityDays: 7,
    budgetRange: [900, 1500],
    lookingFor: 'both',
    purpose: "",
    notificationPreference: 'both',
    status: 'active'
  });

  // Handle plan creation
  const handleCreatePlan = () => {
    if (!newPlan.location || !newPlan.purpose) {
      return;
    }

    const plan: FutureHousingPlan = {
      id: `plan-${Date.now()}`,
      location: newPlan.location || "",
      moveInDate: newPlan.moveInDate || new Date(),
      flexibilityDays: newPlan.flexibilityDays || 7,
      budgetRange: newPlan.budgetRange || [900, 1500],
      lookingFor: newPlan.lookingFor || 'both',
      purpose: newPlan.purpose || "",
      notificationPreference: newPlan.notificationPreference || 'both',
      status: 'active',
      additionalNotes: newPlan.additionalNotes
    };

    setPlans([...plans, plan]);
    setIsCreatingPlan(false);
    
    // Reset form
    setNewPlan({
      location: "",
      moveInDate: new Date(),
      flexibilityDays: 7,
      budgetRange: [900, 1500],
      lookingFor: 'both',
      purpose: "",
      notificationPreference: 'both',
      status: 'active'
    });

    showSuccess(
      "Housing plan created", 
      "We'll notify you when there are matches for your future housing plan"
    );

    // Show a match notification as a demo after a delay
    setTimeout(() => {
      showPlanMatch(
        "New housing match found!", 
        "We found a potential roommate for your Toronto plan in September 2025."
      );
    }, 5000);
  };

  return (
    <AccordionItem value="future-housing-plan" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span className="text-xl font-semibold">My Future Housing Plan</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Future Housing Plan</h3>
                {!isCreatingPlan && (
                  <Button onClick={() => setIsCreatingPlan(true)}>
                    Create New Plan
                  </Button>
                )}
              </div>
              
              <p className="text-muted-foreground">
                Plan your future housing needs and get notified when matching roommates or properties become available.
              </p>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="plans">My Plans</TabsTrigger>
                  <TabsTrigger value="recommendations">
                    Recommendations
                    <Badge className="ml-2 bg-blue-500" variant="secondary">
                      {recommendations.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="matches">
                    Matches
                    <Badge className="ml-2 bg-green-500" variant="secondary">2</Badge>
                  </TabsTrigger>
                </TabsList>
                
                {/* My Plans Tab */}
                <TabsContent value="plans" className="space-y-4 pt-4">
                  <PlansTab 
                    plans={plans}
                    isCreatingPlan={isCreatingPlan}
                    newPlan={newPlan}
                    setNewPlan={setNewPlan}
                    setIsCreatingPlan={setIsCreatingPlan}
                    handleCreatePlan={handleCreatePlan}
                  />
                </TabsContent>
                
                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-4 pt-4">
                  <RecommendationsTab recommendations={recommendations} />
                </TabsContent>
                
                {/* Matches Tab */}
                <TabsContent value="matches" className="space-y-4 pt-4">
                  <MatchesTab />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
