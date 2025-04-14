
import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormSectionProps } from "./types";

export function DateSection({ newPlan, setNewPlan }: FormSectionProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Helper for date display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handle date selection and close calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setNewPlan({...newPlan, moveInDate: date});
      // Close the calendar automatically after selection
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Move-in Date</label>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
