
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarNavigationProps {
  displayMonth: Date;
  onSelect: (month: Date) => void;
}

export function CalendarNavigation({ 
  displayMonth,
  onSelect
}: CalendarNavigationProps) {
  // Get current year and month from the displayMonth prop
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();
  
  // Generate years (5 years back, 10 years forward)
  const years = Array.from({ length: 16 }, (_, i) => currentYear - 5 + i);
  
  // Month names
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Handle year change
  const handleYearChange = (year: string) => {
    const newDate = new Date(displayMonth);
    newDate.setFullYear(parseInt(year));
    onSelect(newDate);
  };

  // Handle month change
  const handleMonthChange = (monthName: string) => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(months.indexOf(monthName));
    onSelect(newDate);
  };

  // Previous month button handler
  const handlePrevMonth = () => {
    const prevMonth = new Date(displayMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onSelect(prevMonth);
  };

  // Next month button handler
  const handleNextMonth = () => {
    const nextMonth = new Date(displayMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onSelect(nextMonth);
  };

  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center">
        <button
          onClick={handlePrevMonth}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <Select
          value={months[currentMonth]}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="h-7 w-[110px] text-xs font-medium">
            <SelectValue placeholder={months[currentMonth]} />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month} className="text-xs">
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentYear.toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="h-7 w-[80px] text-xs font-medium">
            <SelectValue placeholder={currentYear.toString()} />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()} className="text-xs">
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center">
        <button
          onClick={handleNextMonth}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
