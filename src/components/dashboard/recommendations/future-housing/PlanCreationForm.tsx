
import React from "react";
import { CalendarIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FutureHousingPlan } from "./types";

interface PlanCreationFormProps {
  newPlan: Partial<FutureHousingPlan>;
  setNewPlan: (plan: Partial<FutureHousingPlan>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PlanCreationForm({ 
  newPlan, 
  setNewPlan, 
  onSave, 
  onCancel 
}: PlanCreationFormProps) {
  // Helper for date display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">Create New Housing Plan</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Purpose</label>
          <Input 
            placeholder="E.g., University, Work, Internship"
            value={newPlan.purpose || ''}
            onChange={(e) => setNewPlan({...newPlan, purpose: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Move-in Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newPlan.moveInDate ? (
                  formatDate(newPlan.moveInDate)
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={newPlan.moveInDate}
                onSelect={(date) => setNewPlan({...newPlan, moveInDate: date || new Date()})}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
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
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Looking For</label>
          <Select 
            defaultValue="both"
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
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Notifications</label>
          <Select 
            defaultValue="both"
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
        
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Budget Range</label>
          <div className="pt-6 px-2">
            <Slider
              defaultValue={[900, 1500]}
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
        
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Additional Notes</label>
          <textarea
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Any specific requirements or preferences"
            value={newPlan.additionalNotes || ''}
            onChange={(e) => setNewPlan({...newPlan, additionalNotes: e.target.value})}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          Save Plan
        </Button>
      </div>
    </div>
  );
}
