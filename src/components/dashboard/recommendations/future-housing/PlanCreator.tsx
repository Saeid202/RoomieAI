
import React, { useState } from "react";
import { FutureHousingPlan } from "./types";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { PlanCreationForm } from "./PlanCreationForm";

interface PlanCreatorProps {
  plans: FutureHousingPlan[];
  setPlans: React.Dispatch<React.SetStateAction<FutureHousingPlan[]>>;
  isCreatingPlan: boolean;
  setIsCreatingPlan: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PlanCreator({
  plans,
  setPlans,
  isCreatingPlan,
  setIsCreatingPlan
}: PlanCreatorProps) {
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

  if (!isCreatingPlan) {
    return null;
  }

  return (
    <PlanCreationForm 
      newPlan={newPlan} 
      setNewPlan={setNewPlan}
      onSave={handleCreatePlan}
      onCancel={() => setIsCreatingPlan(false)}
    />
  );
}
