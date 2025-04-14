
import React from "react";
import { Button } from "@/components/ui/button";
import { PlanCard } from "./PlanCard";
import { PlanCreationForm } from "./PlanCreationForm";
import { FutureHousingPlan } from "./types";

interface PlansTabProps {
  plans: FutureHousingPlan[];
  isCreatingPlan: boolean;
  newPlan: Partial<FutureHousingPlan>;
  setNewPlan: (plan: Partial<FutureHousingPlan>) => void;
  setIsCreatingPlan: (value: boolean) => void;
  handleCreatePlan: () => void;
}

export function PlansTab({ 
  plans, 
  isCreatingPlan, 
  newPlan, 
  setNewPlan, 
  setIsCreatingPlan, 
  handleCreatePlan 
}: PlansTabProps) {
  if (isCreatingPlan) {
    return (
      <PlanCreationForm 
        newPlan={newPlan} 
        setNewPlan={setNewPlan}
        onSave={handleCreatePlan}
        onCancel={() => setIsCreatingPlan(false)}
      />
    );
  }

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
