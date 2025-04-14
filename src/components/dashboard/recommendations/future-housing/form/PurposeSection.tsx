
import React from "react";
import { Input } from "@/components/ui/input";
import { FormSectionProps } from "./types";

export function PurposeSection({ newPlan, setNewPlan }: FormSectionProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Purpose</label>
      <Input 
        placeholder="E.g., University, Work, Internship"
        value={newPlan.purpose || ''}
        onChange={(e) => setNewPlan({...newPlan, purpose: e.target.value})}
      />
    </div>
  );
}
