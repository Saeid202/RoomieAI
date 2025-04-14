
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlanRecommendation } from "./types";

interface FutureHousingHeaderProps {
  isCreatingPlan: boolean;
  setIsCreatingPlan: (value: boolean) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  recommendations: PlanRecommendation[];
}

export function FutureHousingHeader({
  isCreatingPlan,
  setIsCreatingPlan,
  activeTab,
  setActiveTab,
  recommendations
}: FutureHousingHeaderProps) {
  return (
    <>
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
      </Tabs>
    </>
  );
}
