
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { FutureHousingPlan, PlanRecommendation } from "./types";
import { PlansTab } from "./PlansTab";
import { RecommendationsTab } from "./RecommendationsTab";
import { MatchesTab } from "./MatchesTab";
import { PlanCreator } from "./PlanCreator";

interface FutureHousingTabsProps {
  activeTab: string;
  plans: FutureHousingPlan[];
  recommendations: PlanRecommendation[];
  setPlans: React.Dispatch<React.SetStateAction<FutureHousingPlan[]>>;
  isCreatingPlan: boolean;
  setIsCreatingPlan: React.Dispatch<React.SetStateAction<boolean>>;
}

export function FutureHousingTabs({
  activeTab,
  plans,
  recommendations,
  setPlans,
  isCreatingPlan,
  setIsCreatingPlan
}: FutureHousingTabsProps) {
  return (
    <>
      {/* My Plans Tab */}
      <TabsContent value="plans" className="space-y-4 pt-4">
        {isCreatingPlan ? (
          <PlanCreator 
            plans={plans}
            setPlans={setPlans}
            isCreatingPlan={isCreatingPlan}
            setIsCreatingPlan={setIsCreatingPlan}
          />
        ) : (
          <PlansTab 
            plans={plans}
            isCreatingPlan={isCreatingPlan}
            setIsCreatingPlan={setIsCreatingPlan}
          />
        )}
      </TabsContent>
      
      {/* Recommendations Tab */}
      <TabsContent value="recommendations" className="space-y-4 pt-4">
        <RecommendationsTab recommendations={recommendations} />
      </TabsContent>
      
      {/* Matches Tab */}
      <TabsContent value="matches" className="space-y-4 pt-4">
        <MatchesTab />
      </TabsContent>
    </>
  );
}
