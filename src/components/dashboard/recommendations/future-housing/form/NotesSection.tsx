
import React from "react";
import { FormSectionProps } from "./types";

export function NotesSection({ newPlan, setNewPlan }: FormSectionProps) {
  return (
    <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-medium">Additional Notes</label>
      <textarea
        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        placeholder="Any specific requirements or preferences"
        value={newPlan.additionalNotes || ''}
        onChange={(e) => setNewPlan({...newPlan, additionalNotes: e.target.value})}
      />
    </div>
  );
}
