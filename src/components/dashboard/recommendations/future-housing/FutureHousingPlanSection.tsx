
import React, { useState } from "react";
import { Clock } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileFormValues } from "@/types/profile";
import { initialPlans, mockRecommendations } from "./mockData";
import { FutureHousingPlan, PlanRecommendation } from "./types";
import { FutureHousingHeader } from "./FutureHousingHeader";
import { FutureHousingTabs } from "./FutureHousingTabs";

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
              <FutureHousingHeader 
                isCreatingPlan={isCreatingPlan}
                setIsCreatingPlan={setIsCreatingPlan}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                recommendations={recommendations}
              />
              
              <FutureHousingTabs 
                activeTab={activeTab}
                plans={plans}
                recommendations={recommendations}
                setPlans={setPlans}
                isCreatingPlan={isCreatingPlan}
                setIsCreatingPlan={setIsCreatingPlan}
              />
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
