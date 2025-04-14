
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { CalendarNavigation } from "./calendar/CalendarNavigation";
import { CalendarProps } from "./calendar/types";
import { getDefaultClassNames, closePopover } from "./calendar/helpers";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  // Handle selection and close popover in single mode
  const handleDayClick = React.useCallback(() => {
    if (props.mode === "single" && props.selected === undefined) {
      // Close any open popover after selection (for single mode only)
      closePopover();
    }
  }, [props.mode, props.selected]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        ...getDefaultClassNames(),
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth }) => (
          <CalendarNavigation 
            displayMonth={displayMonth || currentMonth} 
            onSelect={(date) => {
              setCurrentMonth(date);
              props.onMonthChange?.(date);
            }} 
          />
        )
      }}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      onDayClick={handleDayClick}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
