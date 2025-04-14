
import React from "react";
import { Button } from "@/components/ui/button";
import { PlanCard } from "./PlanCard";
import { FutureHousingPlan } from "./types";

interface PlansTabProps {
  plans: FutureHousingPlan[];
  isCreatingPlan: boolean;
  setIsCreatingPlan: (value: boolean) => void;
}

export function PlansTab({ 
  plans, 
  isCreatingPlan, 
  setIsCreatingPlan
}: PlansTabProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No housing plans created yet.</p>
        <Button onClick={() => setIsCreatingPlan(true)} className="mt-4">
          Create Your First Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
