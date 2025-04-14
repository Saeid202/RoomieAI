
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSectionProps } from "./types";

export function LookingForSection({ newPlan, setNewPlan }: FormSectionProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Looking For</label>
      <Select 
        defaultValue={newPlan.lookingFor || "both"}
        value={newPlan.lookingFor}
        onValueChange={(value) => setNewPlan({
          ...newPlan, 
          lookingFor: value as 'roommate' | 'property' | 'both'
        })}
      >
        <SelectTrigger>
          <SelectValue placeholder="What are you looking for?" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="roommate">Roommate Only</SelectItem>
          <SelectItem value="property">Property Only</SelectItem>
          <SelectItem value="both">Both Roommate & Property</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function NotificationSection({ newPlan, setNewPlan }: FormSectionProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Notifications</label>
      <Select 
        defaultValue={newPlan.notificationPreference || "both"}
        value={newPlan.notificationPreference}
        onValueChange={(value) => setNewPlan({
          ...newPlan, 
          notificationPreference: value as 'email' | 'app' | 'both'
        })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Notification preference" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="email">Email Only</SelectItem>
          <SelectItem value="app">In-App Only</SelectItem>
          <SelectItem value="both">Email & In-App</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
