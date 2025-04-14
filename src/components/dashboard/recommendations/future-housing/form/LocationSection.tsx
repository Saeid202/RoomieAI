
import React from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormSectionProps } from "./types";

export function LocationSection({ newPlan, setNewPlan }: FormSectionProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Location</label>
      <div className="flex">
        <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input 
          placeholder="Enter city or area"
          value={newPlan.location || ''}
          onChange={(e) => setNewPlan({...newPlan, location: e.target.value})}
          className="rounded-l-none"
        />
      </div>
    </div>
  );
}
