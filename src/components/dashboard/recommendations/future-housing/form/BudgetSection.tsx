
import React from "react";
import { Slider } from "@/components/ui/slider";
import { FormSectionProps } from "./types";

export function BudgetSection({ newPlan, setNewPlan }: FormSectionProps) {
  return (
    <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-medium">Budget Range</label>
      <div className="pt-6 px-2">
        <Slider
          defaultValue={newPlan.budgetRange || [900, 1500]}
          min={500}
          max={3000}
          step={50}
          value={newPlan.budgetRange || [900, 1500]}
          onValueChange={(value) => setNewPlan({...newPlan, budgetRange: [value[0], value[1]]})}
        />
        <div className="flex justify-between mt-2">
          <span>${newPlan.budgetRange?.[0] || 900}</span>
          <span>${newPlan.budgetRange?.[1] || 1500}</span>
        </div>
      </div>
    </div>
  );
}
