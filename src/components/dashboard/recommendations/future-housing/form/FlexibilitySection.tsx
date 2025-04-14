
import React from "react";
import { Slider } from "@/components/ui/slider";
import { FormSectionProps } from "./types";

export function FlexibilitySection({ newPlan, setNewPlan }: FormSectionProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Date Flexibility (Days)</label>
      <div className="pt-2 px-2">
        <Slider
          defaultValue={[7]}
          max={30}
          step={1}
          value={[newPlan.flexibilityDays || 7]}
          onValueChange={(value) => setNewPlan({...newPlan, flexibilityDays: value[0]})}
        />
        <div className="text-center mt-2">
          {newPlan.flexibilityDays} days
        </div>
      </div>
    </div>
  );
}
