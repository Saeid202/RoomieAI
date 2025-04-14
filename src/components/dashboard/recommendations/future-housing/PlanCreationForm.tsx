
import React from "react";
import { PlanCreationFormProps } from "./form/types";
import { LocationSection } from "./form/LocationSection";
import { PurposeSection } from "./form/PurposeSection";
import { DateSection } from "./form/DateSection";
import { FlexibilitySection } from "./form/FlexibilitySection";
import { LookingForSection, NotificationSection } from "./form/PreferenceSection";
import { BudgetSection } from "./form/BudgetSection";
import { NotesSection } from "./form/NotesSection";
import { FormActions } from "./form/FormActions";

export function PlanCreationForm({ 
  newPlan, 
  setNewPlan, 
  onSave, 
  onCancel 
}: PlanCreationFormProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">Create New Housing Plan</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LocationSection newPlan={newPlan} setNewPlan={setNewPlan} />
        <PurposeSection newPlan={newPlan} setNewPlan={setNewPlan} />
        <DateSection newPlan={newPlan} setNewPlan={setNewPlan} />
        <FlexibilitySection newPlan={newPlan} setNewPlan={setNewPlan} />
        <LookingForSection newPlan={newPlan} setNewPlan={setNewPlan} />
        <NotificationSection newPlan={newPlan} setNewPlan={setNewPlan} />
        <BudgetSection newPlan={newPlan} setNewPlan={setNewPlan} />
        <NotesSection newPlan={newPlan} setNewPlan={setNewPlan} />
      </div>
      
      <FormActions onCancel={onCancel} onSave={onSave} />
    </div>
  );
}
